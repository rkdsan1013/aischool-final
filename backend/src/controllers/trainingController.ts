// backend/src/controllers/trainingController.ts
import { Request, Response } from "express";
import {
  getQuestionsByType,
  verifyUserAnswer,
  verifyWritingAnswerService,
  TrainingType,
  QuestionItem,
} from "../services/trainingService";
import { calculatePoints } from "../utils/gamification";
import { updateUserScoreAndTier } from "../models/trainingModel";
import { verifySpeakingWithAudio } from "../ai/generators/speaking";
import { normalizeForCompare } from "../utils/normalization";

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

    const questions: QuestionItem[] = await getQuestionsByType(type, {
      level: user.level,
      level_progress: user.level_progress,
    });

    return res.json(questions);
  } catch (err) {
    console.error(`[TRAINING CONTROLLER] error:`, err);
    return res.status(500).json({ error: "Question generation failed" });
  }
}

export async function verifyAnswerHandler(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { type, userAnswer, correctAnswer, questionText } = req.body;

    if (!type || userAnswer === undefined || correctAnswer === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let isCorrect = false;
    let feedbackTranscript = ""; // 프론트엔드에 보여줄 텍스트 (주로 사용자 입력)

    // --- 유형별 검증 로직 ---
    if (type === "writing") {
      const intendedAnswer = Array.isArray(correctAnswer)
        ? correctAnswer[0]
        : String(correctAnswer);
      const userText = String(userAnswer);

      const result = await verifyWritingAnswerService(
        String(questionText || ""),
        intendedAnswer,
        userText
      );

      isCorrect = result.isCorrect;
      // [수정] 불필요한 reasoning은 제거하고, 사용자가 입력한 텍스트만 돌려줌 (UI 표시용)
      feedbackTranscript = userText;
    } else if (type === "speaking") {
      const base64String = String(userAnswer);
      if (base64String.startsWith("data:audio")) {
        let fileExtension = "webm";
        // ... (확장자 추출 로직 생략 없이 유지)
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
          isCorrect = false;
        }
      } else {
        // Fallback
        const userText = base64String.trim();
        const targetText = String(correctAnswer).trim();
        const normUser = normalizeForCompare(userText);
        const normTarget = normalizeForCompare(targetText);
        isCorrect = normUser === normTarget;
        feedbackTranscript = userText;
      }
    } else {
      // Vocabulary, Sentence, Blank
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
    }

    // [최종 응답] reasoning 없이 깔끔한 JSON 리턴
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
