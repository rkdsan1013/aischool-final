import { apiClient, handleApiError } from "../api"; // ✅ ServiceError 임포트 제거

// 1. UserProfile 응답 타입 정의
// (MyPage.tsx에서 사용할 데이터 타입)
export type UserProfileResponse = {
  user_id: number;
  email: string;
  name: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  level_progress: number;
  streak_count: number;
  total_study_time: number;
  profile_img: string | null;

  // --- 통계 데이터 (백엔드가 /users/me 엔드포인트에서 함께 제공한다고 가정) ---
  completed_lessons: number;
  weekly_goal: number;
  weekly_progress: number;
};

/**
 * 2. 현재 로그인된 사용자의 프로필 정보 조회
 * (백엔드 엔드포인트: /api/users/me)
 */
export async function getMyProfile(): Promise<UserProfileResponse> {
  try {
    // ✅ apiClient.get 사용
    const res = await apiClient.get<UserProfileResponse>("/users/me");
    return res.data;
  } catch (error) {
    // ✅ 표준 에러 핸들러 사용
    // 401 (미인증) 에러는 api/index.ts의 인터셉터가 자동으로 refresh 시도
    // refresh 실패 시 handleApiError가 ServiceError를 throw
    handleApiError(error, "프로필 조회");
  }
}

// 3. (참고) ServiceError 타입은 이 파일을 호출하는
//    MyPage.tsx 같은 컴포넌트에서 import하여 사용합니다.
// import { ServiceError } from "../api";
