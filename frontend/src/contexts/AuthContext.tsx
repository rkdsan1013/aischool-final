// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import {
  getMyProfile,
  type UserProfileResponse,
} from "../services/userService"; // ✅ 경로 수정
import { logout as logoutService } from "../services/authService"; // ✅ 경로 수정
import { ServiceError } from "../api"; // ✅ 경로 수정

// 1. Context 상태 타입 정의
interface AuthContextState {
  isLoggedIn: boolean;
  profile: UserProfileResponse | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>; // ✅ 로그인/회원가입 후 프로필 갱신 함수
}

// 2. Context 생성
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// 3. Provider 컴포넌트 생성
interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 앱 시작 시 초기 로딩 상태 // ✅ 프로필을 가져오는 로직을 useCallback으로 분리

  const refreshProfile = useCallback(async () => {
    try {
      const userProfile = await getMyProfile();
      setProfile(userProfile);
    } catch (err: unknown) {
      if (err instanceof ServiceError) {
        console.warn("로그인 상태 아님:", err.message);
      }
      setProfile(null);
    }
  }, []); // 앱 로드 시, 쿠키(토큰) 기반으로 사용자 정보 가져오기

  useEffect(() => {
    const checkUserStatus = async () => {
      setIsLoading(true); // ✅ 초기 인증 시작
      await refreshProfile();
      setIsLoading(false); // ✅ 초기 인증 완료
    };

    checkUserStatus();
  }, [refreshProfile]); // ✅ refreshProfile은 useCallback으로 보장됨 // 로그아웃 함수

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("로그아웃 API 실패:", err);
    } finally {
      setProfile(null);
    }
  }, []); // Context 값

  const value = {
    isLoggedIn: !!profile,
    profile,
    isLoading,
    logout,
    refreshProfile, // ✅ refreshProfile 함수를 context 값으로 제공
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Custom Hook 생성 (변경 없음)
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.");
  }
  return context;
}
