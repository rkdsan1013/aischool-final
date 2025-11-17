import { Router, Request, Response } from "express";

export type TrainingType =
  | "vocabulary"
  | "sentence"
  | "blank"
  | "writing"
  | "speaking";

interface QuestionItem {
  id: string;
  type: TrainingType;
  question: string;
  options?: string[];
  correct?: string | string[];
}

/**
 * 임시 더미 데이터 (프론트와 동일한 형식)
 * 실제 구현 시 DB 또는 외부 서비스에서 로드하도록 변경
 */
const DUMMY: Record<TrainingType, QuestionItem[]> = {
  vocabulary: [
    {
      id: "v1",
      type: "vocabulary",
      question: "사과",
      options: ["Apple", "Banana", "Orange", "Grape"],
      correct: "Apple",
    },
  ],
  sentence: [
    {
      id: "s1",
      type: "sentence",
      question: "배고파 I am",
      options: ["I", "am", "hungry"],
      correct: ["I", "am", "hungry"],
    },
  ],
  blank: [
    {
      id: "b1",
      type: "blank",
      question: "She ____ to school every day. (go)",
      options: ["go", "goes", "going", "went"],
      correct: "goes",
    },
  ],
  writing: [
    {
      id: "w1",
      type: "writing",
      question: "자기소개를 영어로 한 문장으로 작성하세요.",
      options: [],
      correct: "",
    },
  ],
  speaking: [
    {
      id: "sp1",
      type: "speaking",
      question: "따라 말해보세요: How's the weather today?",
      correct: "",
    },
  ],
};

const router = Router();

/**
 * GET /api/training/:type
 * path parameter :type 은 TrainingType 중 하나여야 함
 */
router.get("/:type", (req: Request, res: Response) => {
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

  const data = DUMMY[type as TrainingType] ?? [];
  return res.json(data);
});

export default router;
