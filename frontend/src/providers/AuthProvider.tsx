// src/providers/AuthProvider.tsx
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AuthContext } from "../contexts/authContext";
import {
  getMyProfile,
  type UserProfileResponse,
} from "../services/userService";
import { logout as logoutService } from "../services/authService";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const initializedRef = useRef(false);

  const refreshProfile =
    useCallback(async (): Promise<UserProfileResponse | null> => {
      try {
        console.log("[Auth] refreshProfile start (background)");
        const userProfile = await getMyProfile();
        console.log("[Auth] getMyProfile result:", userProfile);
        setProfile(userProfile ?? null);
        return userProfile ?? null;
      } catch (err: unknown) {
        console.warn("[Auth] refreshProfile handled error:", err);
        setProfile(null);
        return null;
      }
    }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const checkUserStatus = async () => {
      // UX 우선: 화면을 바로 보여주고 프로필은 백그라운드로 불러옵니다.
      setIsLoading(false);
      console.log(
        "[AuthProvider] setIsLoading(false) - show UI first, refresh in background"
      );

      // 백그라운드로 프로필 갱신 (에러는 내부에서 처리)
      void refreshProfile();
    };

    void checkUserStatus();
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("[Auth] logout failed:", err);
    } finally {
      setProfile(null);
      console.log("[Auth] logout: profile cleared");
    }
  }, []);

  const value = {
    isLoggedIn: !!profile,
    profile,
    isLoading,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
