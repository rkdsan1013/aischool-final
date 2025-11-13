// frontend/src/contexts/profileContext.ts
import { createContext } from "react";
import type { UserProfileResponse } from "../services/userService";

export interface ProfileContextState {
  profile: UserProfileResponse | null;
  isProfileLoading: boolean;
  refreshProfile: () => Promise<UserProfileResponse | null>;
  setProfileLocal: (p: UserProfileResponse | null) => void;
}

export const ProfileContext = createContext<ProfileContextState | undefined>(
  undefined
);
