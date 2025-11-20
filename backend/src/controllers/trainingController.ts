// backend/src/controllers/trainingController.ts
import { Request, Response } from "express";
import {
  getQuestionsByType,
  verifyUserAnswer,
  TrainingType,
  QuestionItem,
} from "../services/trainingService";
import { calculatePoints } from "../utils/gamification";
// [신규] 모델 import
import { updateUserScoreAndTier } from "../models/trainingModel";

// URL 파라미터가 유효한 TrainingType인지 확인하는 헬퍼 함수
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

/**
 * GET /api/training/:type
 * (requireAuth 미들웨어를 통과한 후 실행됨)
 */
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

/**
 * POST /api/training/verify
 * 정답 검증 및 점수/티어 DB 업데이트 핸들러
 */
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

    // 1. 정답 검증
    const isCorrect = verifyUserAnswer(
      type as TrainingType,
      userAnswer,
      correctAnswer
    );

    let earnedPoints = 0;
    let newTotalScore = 0; // 현재 총 점수 (DB 업데이트 후)
    let newTier = ""; // 현재 티어 (DB 업데이트 후)

    // 2. 정답일 경우 DB 업데이트
    if (isCorrect) {
      // 2-1. 획득할 점수 계산
      earnedPoints = calculatePoints(user.level);

      // 2-2. DB 업데이트 (점수 누적 & 티어 갱신)
      const result = await updateUserScoreAndTier(user.user_id, earnedPoints);
      newTotalScore = result.newScore;
      newTier = result.newTier;

      console.log(
        `[DB Updated] User ${user.user_id}: +${earnedPoints} points. Total: ${newTotalScore} (${newTier})`
      );
    }

    // 3. 결과 반환
    return res.json({
      isCorrect,
      points: earnedPoints,
      // 클라이언트가 즉시 UI를 갱신할 수 있도록 최신 상태 반환 (선택 사항)
      totalScore: newTotalScore,
      tier: newTier,
    });
  } catch (err) {
    console.error("[TRAINING CONTROLLER] verify error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
}
