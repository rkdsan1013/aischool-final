// frontend/src/services/userService.ts
import { apiClient, handleApiError } from "../api";
import type { AxiosError } from "axios";

export type UserProfileResponse = {
  user_id: number;
  email: string;
  name: string;
  // CEFR 레벨(A1 ~ C2) 또는 null
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  // 레벨 진행률(0-100) 또는 null
  level_progress?: number | null;
  // 연속 학습일 수
  streak_count?: number | null;
  // 총 학습 시간(예: 분 단위) 또는 null
  total_study_time?: number | null;
  profile_img?: string | null;
  // 완료한 레슨 수
  completed_lessons?: number;

  // [신규] 점수 및 티어 추가
  score?: number;
  tier?: string;
};

export async function getMyProfile(): Promise<UserProfileResponse | null> {
  try {
    // console.log("[userService] calling GET /user/me");
    const res = await apiClient.get<UserProfileResponse>("/user/me");
    // console.log("[userService] GET /user/me success:", res.data);
    return res.data;
  } catch (error: unknown) {
    const axiosErr = error as AxiosError | undefined;
    const status = axiosErr?.response?.status;

    // console.warn("[userService] GET /user/me failed, status:", status);

    if (status === 401) {
      // 인증되지 않은 사용자는 null 반환 (로그인 페이지로 리다이렉트 등은 호출부에서 처리)
      return null;
    }

    handleApiError(error, "프로필 조회");
    return null;
  }
}
