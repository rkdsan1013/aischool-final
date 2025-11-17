// src/routes/trainingRouter.ts
import { Router } from "express";
import { fetchTrainingQuestionsHandler } from "../controllers/trainingController";

const router = Router();

/**
 * GET /api/training/:type
 */
router.get("/:type", fetchTrainingQuestionsHandler);

export default router;
