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

/**
 * 내 프로필 조회
 */
export async function getMyProfile(): Promise<UserProfileResponse | null> {
  try {
    const res = await apiClient.get<UserProfileResponse>("/user/me");
    return res.data;
  } catch (error: unknown) {
    const axiosErr = error as AxiosError | undefined;
    const status = axiosErr?.response?.status;

    if (status === 401) {
      // 인증되지 않은 사용자는 null 반환
      return null;
    }

    handleApiError(error, "프로필 조회");
    return null;
  }
}

/**
 * 사용자 프로필 업데이트
 * @param data 업데이트할 프로필 데이터
 */
export async function updateUserProfile(
  data: Partial<UserProfileResponse>
): Promise<UserProfileResponse | null> {
  try {
    const res = await apiClient.put<UserProfileResponse>("/user/me", data);
    return res.data;
  } catch (error: unknown) {
    handleApiError(error, "프로필 업데이트");
    return null;
  }
}

/**
 * 사용자 비밀번호 변경
 * @param current 현재 비밀번호
 * @param next 새 비밀번호
 */
export async function changePassword(
  current: string,
  next: string
): Promise<boolean> {
  try {
    await apiClient.put("/user/me/password", {
      currentPassword: current,
      newPassword: next,
    });
    return true;
  } catch (error: unknown) {
    handleApiError(error, "비밀번호 변경");
    return false;
  }
}

/**
 * 사용자 계정 삭제
 */
export async function deleteUser(): Promise<boolean> {
  try {
    await apiClient.delete("/user/me");
    return true;
  } catch (error: unknown) {
    handleApiError(error, "회원 탈퇴");
    return false;
  }
}
