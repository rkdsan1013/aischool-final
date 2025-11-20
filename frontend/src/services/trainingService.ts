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
      // handleApiError 내부에서 이미 에러 로그 출력
    }
    return [];
  }
}

/**
 * [수정됨] 백엔드에 정답 검증을 요청하고, 획득한 점수를 반환받습니다.
 */
export async function verifyAnswer(payload: {
  type: TrainingType;
  userAnswer: string | string[];
  correctAnswer: string | string[];
}): Promise<{ isCorrect: boolean; points: number }> {
  try {
    // 응답 타입에 points 추가
    const res = await apiClient.post<{ isCorrect: boolean; points: number }>(
      "/training/verify",
      payload
    );

    return {
      isCorrect: res.data?.isCorrect ?? false,
      points: res.data?.points ?? 0,
    };
  } catch (err) {
    console.error("정답 검증 API 오류:", err);
    return { isCorrect: false, points: 0 };
  }
}
