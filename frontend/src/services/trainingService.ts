// frontend/src/services/trainingService.ts
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
      // handler 자체 예외 무시
    }
    return [];
  }
}

/**
 * [수정됨] 백엔드에 정답 검증을 요청합니다.
 * - 반환값에 totalScore(누적 점수)와 tier(현재 티어)를 추가했습니다.
 * - 이를 통해 프론트엔드에서 즉시 프로필 상태를 업데이트할 수 있습니다.
 */
export async function verifyAnswer(payload: {
  type: TrainingType;
  userAnswer: string | string[];
  correctAnswer: string | string[];
}): Promise<{
  isCorrect: boolean;
  points: number;
  totalScore?: number; // [신규] 갱신된 총 점수
  tier?: string; // [신규] 갱신된 티어
}> {
  try {
    const res = await apiClient.post<{
      isCorrect: boolean;
      points: number;
      totalScore?: number;
      tier?: string;
    }>("/training/verify", payload);

    return {
      isCorrect: res.data?.isCorrect ?? false,
      points: res.data?.points ?? 0,
      totalScore: res.data?.totalScore,
      tier: res.data?.tier,
    };
  } catch (err) {
    console.error("정답 검증 API 오류:", err);
    return { isCorrect: false, points: 0 };
  }
}
