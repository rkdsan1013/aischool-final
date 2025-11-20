// backend/src/routes/trainingRouter.ts
import { Router } from "express";
import {
  fetchTrainingQuestionsHandler,
  verifyAnswerHandler, // [신규]
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
 * 정답 검증
 */
router.post("/verify", requireAuth, verifyAnswerHandler);

export default router;
