// frontend/src/hooks/useProfile.ts
import { useContext } from "react";
import { ProfileContext } from "../contexts/profileContext";

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
