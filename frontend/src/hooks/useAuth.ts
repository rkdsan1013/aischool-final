// src/hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";

console.log("[useAuth] AuthContext identity (module top):", AuthContext);

export function useAuth() {
  const context = useContext(AuthContext);
  console.log("[useAuth] useContext returned:", context);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
