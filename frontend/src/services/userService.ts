// src/services/userService.ts
import { apiClient, handleApiError } from "../api";
import type { AxiosError } from "axios";

export type UserProfileResponse = {
  user_id: number;
  email: string;
  name: string;
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  level_progress?: number | null;
  streak_count?: number | null;
  total_study_time?: number | null;
  profile_img?: string | null;
  completed_lessons?: number;
  weekly_goal?: number;
  weekly_progress?: number;
};

export async function getMyProfile(): Promise<UserProfileResponse | null> {
  try {
    console.log("[userService] calling GET /user/me");
    const res = await apiClient.get<UserProfileResponse>("/user/me");
    console.log("[userService] GET /user/me success:", res.data);
    return res.data;
  } catch (error: unknown) {
    // AxiosError인지 확인
    const axiosErr = error as AxiosError | undefined;
    const status = axiosErr?.response?.status;
    console.warn("[userService] GET /user/me failed, status:", status);
    if (status === 401) {
      console.warn("[userService] 401 -> returning null (not authenticated)");
      return null;
    }
    handleApiError(error, "프로필 조회");
  }
}
