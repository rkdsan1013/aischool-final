// src/services/trainingService.ts
// 실제 프로젝트의 src/api/index.ts에서 apiClient, handleApiError를 export 하고 있다면 주석 해제하여 사용하세요.
// import { apiClient, handleApiError } from "../api";

export type TrainingType =
  | "vocabulary"
  | "sentence"
  | "blank"
  | "writing"
  | "speaking"; // "speakingListening"에서 "speaking"으로 변경

export interface QuestionItem {
  id: string;
  type: TrainingType;
  question: string;
  options?: string[];
  correct?: string | string[];
  media?: { audio?: string; image?: string };
  meta?: Record<string, unknown>;
}

/**
 * 더미 데이터 (백이 없을 때 테스트용)
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
    // "speakingListening"에서 "speaking"으로 변경
    {
      id: "sp1",
      type: "speaking", // "speakingListening"에서 "speaking"으로 변경
      question: "따라 말해보세요: How's the weather today?", // '말하기'에 맞는 프롬프트로 변경
      // options 속성 제거 (듣기 선택지 불필요)
      correct: "", // '말하기'는 정해진 정답이 없음
    },
  ],
};

/**
 * 서버에 요청을 시도하고, 실패하면 더미 데이터를 지연 응답으로 반환합니다.
 * - 실제 백엔드가 있으면 apiClient.get 를 사용 (GET /training?type=...)
 * - 현재는 api 호출 코드를 주석으로 보존해두었습니다.
 */
export async function fetchTrainingQuestions(
  type: TrainingType
): Promise<QuestionItem[]> {
  // 실제 API 호출 (주석 처리)
  // try {
  //   const res = await apiClient.get<QuestionItem[]>("/training", { params: { type } });
  //   if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
  //     return res.data;
  //   }
  // } catch (err) {
  //   // handleApiError(err, "훈련 문제 로드");
  // }

  // 더미 반환 (비동기/지연 응답 시뮬레이션)
  await new Promise((r) => setTimeout(r, 250));
  return DUMMY[type] ?? [];
}
