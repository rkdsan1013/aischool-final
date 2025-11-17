// src/services/trainingService.ts
import { apiClient, handleApiError } from "../api";

export type TrainingType =
  | "vocabulary"
  | "sentence"
  | "blank"
  | "writing"
  | "speaking";

export interface QuestionItem {
  id: string;
  type: TrainingType;
  question: string;
  options?: string[];
  correct?: string | string[];
}

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

/**
 * 서버에서 훈련 문제를 불러옵니다.
 * - 엔드포인트: GET /training/:type
 * - 클라이언트에서 level 등 필터를 보내지 않도록 변경되어 options 파라미터를 제거했습니다.
 */
export async function fetchTrainingQuestions(
  type: TrainingType
): Promise<QuestionItem[]> {
  try {
    const url = `/training/${encodeURIComponent(type)}`;
    const res = await apiClient.get<QuestionItem[]>(url);
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return [];
  } catch (err) {
    try {
      handleApiError(err, "훈련 문제 로드");
    } catch {
      // ignore handler errors and fallback to dummy
    }
    // 폴백: 더미 데이터(비동기 지연 포함)
    await new Promise((r) => setTimeout(r, 250));
    return DUMMY[type] ?? [];
  }
}
