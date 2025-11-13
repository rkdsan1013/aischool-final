// frontend/src/providers/AuthProvider.tsx
import { useState, useCallback, type ReactNode } from "react";
import { AuthContext } from "../contexts/authContext";
import { logout as logoutService } from "../services/authService";

/**
 * AuthProvider 책임
 * - 인증 상태(isLoggedIn)를 직접 판단하지 않고 토큰/인증 관련 작업(예: logout, refreshAuth)을 제공
 * - isLoggedIn 판별은 ProfileProvider에서 제공하는 profile 정보를 조합해 호출부가 결정하도록 권장
 * - 여기서는 인증 관련 비동기 처리 상태만 제공
 */

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  const logout = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      await logoutService();
    } catch (err) {
      console.error("[AuthProvider] logout failed:", err);
      // 실패 시에도 호출자(프로필 리셋 등)가 처리할 수 있도록 에러를 내부에서 swallow 하지 않음
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    // 인증 전용 새로고침 로직 필요 시 구현 (예: access token 재발급 호출)
    // 현재는 AuthProvider가 토큰을 직접 관리하지 않으므로 빈 함수로 두어 호출부가 필요에 따라 동작시키도록 함
    return;
  }, []);

  const value = {
    isLoggedIn: false, // 실제 판별은 ProfileProvider의 profile을 기반으로 하세요
    isAuthLoading,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
