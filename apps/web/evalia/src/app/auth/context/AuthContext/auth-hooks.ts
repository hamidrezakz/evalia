"use client";
import { useContext } from "react";
import { AuthContext } from "./context-core";
import type { AuthContextValue } from "../auth-types";

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}

export function useRequireAuth() {
  const { accessToken, isTokenExpired, signOut } = useAuthContext();
  // caller can add useEffect externally if needed; keeping hook minimal
  return { accessToken, isTokenExpired, signOut };
}
