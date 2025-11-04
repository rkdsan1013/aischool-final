import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
// ✅ 'ReactNode'는 type-only import로 분리
import type { ReactNode } from "react";
import {
  getMyProfile,
  type UserProfileResponse,
} from "../services/userService";
import { logout as logoutService } from "../services/authService";
import { ServiceError } from "../api";

// 1. Context 상태 타입 정의
interface AuthContextState {
  isLoggedIn: boolean;
  profile: UserProfileResponse | null;
  isLoading: boolean; // 초기 인증 상태 로딩
  logout: () => Promise<void>;
  // TODO: login 함수 추가 (로그인 시 프로필 새로고침 또는 상태 업데이트)
}

// 2. Context 생성 (undefined로 초기화)
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// 3. Provider 컴포넌트 생성
interface AuthProviderProps {
  children: ReactNode;
}

// ✅ React Fast Refresh(ESLint) 규칙을 위해 default export로 변경
export default function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 앱 시작 시 로딩 중 상태

  // 앱 로드 시, 쿠키(토큰) 기반으로 사용자 정보 가져오기
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // /users/me API 호출 (apiClient가 쿠키 알아서 첨부)
        const userProfile = await getMyProfile();
        setProfile(userProfile);
      } catch (err: unknown) {
        // ServiceError (401, 403 등) 발생 시 로그인 안된 상태로 간주
        if (err instanceof ServiceError) {
          console.warn("로그인 상태 아님:", err.message);
        }
        setProfile(null);
      } finally {
        setIsLoading(false); // 인증 상태 확인 완료
      }
    };

    checkUserStatus();
  }, []); // [] : 앱이 처음 마운트될 때 한 번만 실행

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("로그아웃 API 실패:", err);
    } finally {
      // API 성공/실패와 관계없이 프론트엔드 상태는 로그아웃 처리
      setProfile(null);
    }
  }, []);

  // Context 값
  const value = {
    isLoggedIn: !!profile, // profile이 있으면 true
    profile,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Custom Hook 생성
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용해야 합니다.");
  }
  return context;
}
