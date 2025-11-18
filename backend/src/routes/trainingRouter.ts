// src/routes/trainingRouter.ts
import { Router } from "express";
import { fetchTrainingQuestionsHandler } from "../controllers/trainingController";
import { requireAuth } from "../middlewares/auth"; // 1. 인증 미들웨어 import

const router = Router();

/**
 * GET /api/training/:type
 */
// 2. [수정됨] 핸들러 체인에 requireAuth 미들웨어 추가
router.get("/:type", requireAuth, fetchTrainingQuestionsHandler);

export default router;
