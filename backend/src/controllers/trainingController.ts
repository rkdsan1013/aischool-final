// backend/src/controllers/trainingController.ts
import { Request, Response } from "express";
import {
  getQuestionsByType,
  verifyUserAnswer,
  TrainingType,
  QuestionItem,
} from "../services/trainingService";
import { calculatePoints } from "../utils/gamification";
import { updateUserScoreAndTier } from "../models/trainingModel";
import { verifySpeakingWithAudio } from "../llm/models/speakingModel";
import { normalizeForCompare } from "../utils/normalization"; // [추가]

function isValidTrainingType(type: string): type is TrainingType {
  const validTypes: TrainingType[] = [
    "vocabulary",
    "sentence",
    "blank",
    "writing",
    "speaking",
  ];
  return validTypes.includes(type as TrainingType);
}

export async function fetchTrainingQuestionsHandler(
  req: Request,
  res: Response
) {
  try {
    const { type } = req.params;

    if (!type || !isValidTrainingType(type)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing training type" });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const level: string | undefined = user.level;
    const level_progress: number | undefined = user.level_progress;

    const questions: QuestionItem[] = await getQuestionsByType(type, {
      level,
      level_progress,
    });

    console.log(
      `[TRAINING CONTROLLER] Final JSON output (for type: ${type}):\n`,
      JSON.stringify(questions, null, 2)
    );

    return res.json(questions);
  } catch (err) {
    console.error(`[TRAINING CONTROLLER] unexpected error:`, err);
    return res.status(500).json({ error: "Question generation failed" });
  }
}

export async function verifyAnswerHandler(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { type, userAnswer, correctAnswer } = req.body;

    if (!type || userAnswer === undefined || correctAnswer === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let isCorrect = false;
    let feedbackTranscript = "";

    if (type === "speaking") {
      const base64String = String(userAnswer);

      // Base64 데이터인지 확인
      if (base64String.startsWith("data:audio")) {
        // 1. 확장자(MIME Type) 감지
        let fileExtension = "webm";
        const mimeEndIndex = base64String.indexOf(";");
        if (mimeEndIndex > 0) {
          const mimeType = base64String.substring(5, mimeEndIndex);
          if (mimeType.includes("mp4") || mimeType.includes("m4a"))
            fileExtension = "mp4";
          else if (mimeType.includes("mpeg") || mimeType.includes("mp3"))
            fileExtension = "mp3";
          else if (mimeType.includes("wav")) fileExtension = "wav";
          else if (mimeType.includes("ogg")) fileExtension = "ogg";
        }

        console.log(`[Verify Speaking] Detected Ext: ${fileExtension}`);

        // 2. Base64 데이터 추출
        const base64Data = base64String.split(",")[1];

        if (base64Data) {
          const audioBuffer = Buffer.from(base64Data, "base64");

          const result = await verifySpeakingWithAudio(
            audioBuffer,
            String(correctAnswer),
            fileExtension
          );

          isCorrect = result.isCorrect;
          feedbackTranscript = result.transcript;
        } else {
          console.error("[Verify Speaking] Failed to extract base64 data");
          isCorrect = false;
        }
      } else {
        // [수정] 텍스트 비교 Fallback에도 정규화 적용
        const userText = base64String.trim();
        const targetText = String(correctAnswer).trim();

        const normUser = normalizeForCompare(userText);
        const normTarget = normalizeForCompare(targetText);

        isCorrect = normUser === normTarget;
        feedbackTranscript = userText;
      }
    } else {
      // 기존 텍스트 기반 검증 (Vocabulary, Sentence 등)
      isCorrect = verifyUserAnswer(
        type as TrainingType,
        userAnswer,
        correctAnswer
      );
    }

    let earnedPoints = 0;
    let newTotalScore = 0;
    let newTier = "";

    if (isCorrect) {
      earnedPoints = calculatePoints(user.level);
      const result = await updateUserScoreAndTier(user.user_id, earnedPoints);
      newTotalScore = result.newScore;
      newTier = result.newTier;

      console.log(
        `[DB Updated] User ${user.user_id}: +${earnedPoints} points. Total: ${newTotalScore} (${newTier})`
      );
    }

    return res.json({
      isCorrect,
      points: earnedPoints,
      totalScore: newTotalScore,
      tier: newTier,
      transcript: feedbackTranscript,
    });
  } catch (err) {
    console.error("[TRAINING CONTROLLER] verify error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
}
