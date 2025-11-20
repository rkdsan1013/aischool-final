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

// Blob을 Base64로 변환하는 헬퍼 함수
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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
      // Ignore
    }
    return [];
  }
}

export async function verifyAnswer(payload: {
  type: TrainingType;
  userAnswer: string | string[] | Blob;
  correctAnswer: string | string[];
}): Promise<{
  isCorrect: boolean;
  points: number;
  totalScore?: number;
  tier?: string;
  transcript?: string;
}> {
  try {
    let finalUserAnswer = payload.userAnswer;

    // Speaking 타입이고 Blob(오디오)인 경우 Base64 변환
    if (payload.type === "speaking" && payload.userAnswer instanceof Blob) {
      finalUserAnswer = await blobToBase64(payload.userAnswer);
    }

    const res = await apiClient.post<{
      isCorrect: boolean;
      points: number;
      totalScore?: number;
      tier?: string;
      transcript?: string;
    }>("/training/verify", {
      ...payload,
      userAnswer: finalUserAnswer,
    });

    return {
      isCorrect: res.data?.isCorrect ?? false,
      points: res.data?.points ?? 0,
      totalScore: res.data?.totalScore,
      tier: res.data?.tier,
      transcript: res.data?.transcript,
    };
  } catch (err) {
    console.error("정답 검증 API 오류:", err);
    return { isCorrect: false, points: 0 };
  }
}
