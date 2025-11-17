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

/**
 * 서버에서 훈련 문제를 불러옵니다.
 * - 엔드포인트: GET /api/training/:type
 * - 더미 데이터 폴백을 제거하고, 에러 발생 시 handleApiError를 실행한 뒤 빈 배열을 반환합니다.
 */
export async function fetchTrainingQuestions(
  type: TrainingType
): Promise<QuestionItem[]> {
  try {
    const url = `/training/${encodeURIComponent(type)}`;
    const res = await apiClient.get<QuestionItem[]>(url);
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    try {
      handleApiError(err, "훈련 문제 로드");
    } catch {
      // handler 자체에서 예외가 발생하면 무시하고 아래에서 빈 배열 반환
    }
    return [];
  }
}
