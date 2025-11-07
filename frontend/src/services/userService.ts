// src/services/userService.ts
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
  // backend에 남아있을 수 있는 기타 필드들은 제외 (이번 주 목표 카드 제거에 따라 관련 필드 제거)
};

export async function getMyProfile(): Promise<UserProfileResponse | null> {
  try {
    console.log("[userService] calling GET /user/me");
    const res = await apiClient.get<UserProfileResponse>("/user/me");
    console.log("[userService] GET /user/me success:", res.data);
    return res.data;
  } catch (error: unknown) {
    const axiosErr = error as AxiosError | undefined;
    const status = axiosErr?.response?.status;
    console.warn("[userService] GET /user/me failed, status:", status);
    if (status === 401) {
      console.warn("[userService] 401 -> returning null (not authenticated)");
      return null;
    }
    handleApiError(error, "프로필 조회");
    return null;
  }
}
