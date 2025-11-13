// frontend/src/providers/ProfileProvider.tsx
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { ProfileContext } from "../contexts/profileContext";
import { getMyProfile } from "../services/userService";
import type { UserProfileResponse } from "../services/userService";

interface ProfileProviderProps {
  children: ReactNode;
}

/**
 * 안전한 ProfileProvider
 * - initializedRef: 최초 자동 페치 한 번만 실행
 * - inFlightRef: 동시/중복 요청 방지 (같은 Promise 재사용)
 * - refreshProfile(): 중복 호출 차단, 실패 시 profile을 null로 설정
 */
export default function ProfileProvider({ children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const initializedRef = useRef(false);

  // inFlightRef는 현재 진행중인 refresh Promise를 저장합니다.
  // 이미 요청 중이면 동일한 Promise를 반환하여 중복 요청을 방지합니다.
  const inFlightRef = useRef<Promise<UserProfileResponse | null> | null>(null);

  const refreshProfile =
    useCallback(async (): Promise<UserProfileResponse | null> => {
      // 이미 요청 중이면 그 Promise를 재사용
      if (inFlightRef.current) {
        return inFlightRef.current;
      }

      setIsProfileLoading(true);

      const p = (async () => {
        try {
          const userProfile = await getMyProfile();
          setProfile(userProfile ?? null);
          return userProfile ?? null;
        } catch (err) {
          console.warn("[ProfileProvider] refreshProfile error:", err);
          setProfile(null);
          return null;
        } finally {
          setIsProfileLoading(false);
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = p;
      return p;
    }, []);

  // 최초 마운트 시 한 번만 백그라운드로 프로필을 불러옵니다.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    void refreshProfile();
  }, [refreshProfile]);

  const setProfileLocal = useCallback((p: UserProfileResponse | null) => {
    setProfile(p);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isProfileLoading,
        refreshProfile,
        setProfileLocal,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
