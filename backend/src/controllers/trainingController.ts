// src/controllers/trainingController.ts
import { Request, Response } from "express";
import {
  getQuestionsByType,
  TrainingType,
  QuestionItem,
} from "../services/trainingService";

/**
 * GET /api/training/:type
 */
export async function fetchTrainingQuestionsHandler(
  req: Request,
  res: Response
) {
  const { type } = req.params;
  if (
    type !== "vocabulary" &&
    type !== "sentence" &&
    type !== "blank" &&
    type !== "writing" &&
    type !== "speaking"
  ) {
    return res.status(400).json({ error: "Invalid training type" });
  }

  try {
    const data: QuestionItem[] = await getQuestionsByType(type as TrainingType);
    return res.json(data);
  } catch (err) {
    console.error("Failed to load training questions:", err);
    return res.status(500).json({ error: "Failed to load training questions" });
  }
}
