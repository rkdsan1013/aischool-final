// frontend/src/contexts/authContext.ts
import { createContext } from "react";

export interface AuthContextState {
  // 인증 관련 최소 상태만 포함합니다 (프로필은 ProfileContext로 분리)
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextState | undefined>(
  undefined
);
