// backend/src/controllers/trainingController.ts
import { Request, Response } from "express";
import {
  getQuestionsByType,
  TrainingType,
  QuestionItem, // QuestionItem을 import 리스트에 추가했습니다.
} from "../services/trainingService";

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

    // 1. 타입 유효성 검사 (헬퍼 함수 사용)
    if (!type || !isValidTrainingType(type)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing training type" });
    }

    // --- [수정됨] ---
    // 2. requireAuth 미들웨어에서 전달된 req.user 객체를 읽습니다.
    const user = req.user;

    // 3. user 객체 확인 (미들웨어를 통과했다면 항상 있어야 함)
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 4. req.user에서 실제 사용자 레벨과 진행도를 추출합니다.
    const level: string | undefined = user.level;
    const level_progress: number | undefined = user.level_progress;
    // --- [수정 완료] ---

    // 5. 추출한 사용자 레벨("A1" 등)을 service로 전달합니다.
    const questions: QuestionItem[] = await getQuestionsByType(type, {
      level,
      level_progress,
    });

    // 6. trainingService가 모든 정규화(id, type, shuffle)를 처리한 최종본 로깅
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
