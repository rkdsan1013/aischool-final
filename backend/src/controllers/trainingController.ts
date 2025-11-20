// backend/src/controllers/trainingController.ts
import { Request, Response } from "express";
import {
  getQuestionsByType,
  verifyUserAnswer,
  TrainingType,
  QuestionItem,
} from "../services/trainingService";
import { calculatePoints } from "../utils/gamification"; // [신규 import]

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
 * 정답 검증 및 점수 계산 핸들러
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

    // 1. 백엔드에서 정답 검증 수행
    const isCorrect = verifyUserAnswer(
      type as TrainingType,
      userAnswer,
      correctAnswer
    );

    // 2. 정답일 경우 레벨에 따른 점수 계산 (오답이면 0점)
    //    req.user.level은 위변조 불가능한 인증 토큰/DB 정보입니다.
    const earnedPoints = isCorrect ? calculatePoints(user.level) : 0;

    // (TODO: 추후 DB에 점수 컬럼이 생기면 여기서 update 쿼리 실행)
    // await userService.addExperience(user.user_id, earnedPoints);

    // 3. 결과 반환
    return res.json({
      isCorrect,
      points: earnedPoints, // 프론트는 이 값을 보여주기만 함
    });
  } catch (err) {
    console.error("[TRAINING CONTROLLER] verify error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
}
