// backend/src/llm/router.ts
import { Router } from "express";
import { vocabularyHandler } from "./controller";

const router = Router();

/**
 * POST /api/llm/vocabulary
 * body: { words: string[], optionsPerWord?: number }
 */
router.post("/vocabulary", vocabularyHandler);

export default router;
