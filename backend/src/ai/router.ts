// backend/src/ai/router.ts
import { Router } from "express";
import {
  vocabularyHandler,
  sentenceHandler,
  blankHandler,
  writingHandler,
  speakingHandler,
} from "./controller";

const router = Router();

/**
 * POST /api/llm/vocabulary
 */
router.post("/vocabulary", vocabularyHandler);

/**
 * POST /api/llm/sentence
 */
router.post("/sentence", sentenceHandler);

/**
 * POST /api/llm/blank
 */
router.post("/blank", blankHandler);

/**
 * POST /api/llm/writing
 */
router.post("/writing", writingHandler);

/**
 * POST /api/llm/speaking
 */
router.post("/speaking", speakingHandler);

export default router;
