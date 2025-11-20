// backend/src/routes/trainingRouter.ts
import { Router } from "express";
import {
  fetchTrainingQuestionsHandler,
  verifyAnswerHandler,
} from "../controllers/trainingController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

/**
 * GET /api/training/:type
 * 학습 문제 생성 및 조회
 */
router.get("/:type", requireAuth, fetchTrainingQuestionsHandler);

/**
 * POST /api/training/verify
 * 정답 검증 (최종 제출용)
 */
router.post("/verify", requireAuth, verifyAnswerHandler);

// [삭제됨] /transcribe-chunk 라우트 제거

export default router;
