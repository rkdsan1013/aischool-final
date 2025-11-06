// src/contexts/authContext.ts
import { createContext } from "react";
import type { UserProfileResponse } from "../services/userService";

export interface AuthContextState {
  isLoggedIn: boolean;
  profile: UserProfileResponse | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfileResponse | null>;
}

export const AuthContext = createContext<AuthContextState | undefined>(
  undefined
);
