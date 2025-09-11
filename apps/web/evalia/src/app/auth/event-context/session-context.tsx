"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { decodeAccessToken, refreshTokens } from "@/lib/api.client";
import { checkAccessToken } from "@/lib/api.auth";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthSessionValue, AccessTokenPayload } from "./types";

const AuthSessionContext = createContext<AuthSessionValue | undefined>(
  undefined
);

export const AuthSessionProvider: React.FC<{
  children: React.ReactNode;
  loginPath?: string;
}> = ({ children, loginPath = "/auth" }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tokens, setTokens] = useState(() => tokenStorage.get());
  const [booting, setBooting] = useState(true);

  const decoded = useMemo<AccessTokenPayload | null>(() => {
    if (!tokens?.accessToken) return null;
    return decodeAccessToken<AccessTokenPayload>();
  }, [tokens?.accessToken]);

  const userId = useMemo<number | null>(() => {
    if (!decoded) return null;
    const raw = decoded.sub;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const n = parseInt(raw, 10);
      return isNaN(n) ? null : n;
    }
    return null;
  }, [decoded]);

  const isTokenExpired = useCallback(() => {
    if (!decoded?.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp < now + 30;
  }, [decoded?.exp]);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setTokens(null);
    queryClient.clear();
    router.replace(loginPath);
  }, [router, queryClient, loginPath]);

  const attemptRefresh = useCallback(async () => {
    const ok = await refreshTokens();
    if (ok) {
      const updated = tokenStorage.get();
      if (updated) setTokens(updated);
    }
    return ok;
  }, []);

  // Periodic token version / validity check
  useEffect(() => {
    if (booting) return; // don't start until initial auth state resolved
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const intervalMs = 90_000; // 3 minutes
    async function runCheck() {
      if (cancelled) return;
      if (tokens?.accessToken) {
        try {
          const data = await checkAccessToken(tokens.accessToken);
          if (
            typeof data === "object" &&
            data !== null &&
            "data" in data &&
            typeof (data as Record<string, unknown>).data === "object" &&
            (data as Record<string, unknown>).data !== null &&
            typeof (data as Record<string, unknown>).data === "object" &&
            (data as Record<string, unknown>).data !== null &&
            "valid" in
              ((data as Record<string, unknown>).data as Record<
                string,
                unknown
              >) &&
            !((data as Record<string, unknown>).data as { valid?: boolean })
              .valid
          ) {
            const reason =
              typeof (data as Record<string, unknown>).data === "object" &&
              (data as Record<string, unknown>).data !== null &&
              "reason" in
                ((data as Record<string, unknown>).data as Record<
                  string,
                  unknown
                >)
                ? (
                    (data as Record<string, unknown>).data as {
                      reason?: unknown;
                    }
                  ).reason
                : undefined;
            signOut();
            return; // stop loop after sign out
          }
          // If valid but near expiry attempt silent refresh
          if (isTokenExpired()) {
            await attemptRefresh();
          }
        } catch {
          // ignore transient network errors; next interval will retry
        }
      }
      timer = setTimeout(runCheck, intervalMs);
    }
    runCheck();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    tokens?.accessToken,
    booting,
    isTokenExpired,
    attemptRefresh,
    signOut,
    tokens,
  ]);

  // Proactive refresh timer
  useEffect(() => {
    if (!decoded?.exp) return;
    const lead = 60; // seconds before expiry
    const now = Date.now() / 1000;
    const delay = (decoded.exp - lead - now) * 1000;
    if (delay <= 0) return;
    const id = setTimeout(() => {
      attemptRefresh();
    }, delay);
    return () => clearTimeout(id);
  }, [decoded?.exp, attemptRefresh]);

  // Storage sync (multi-tab)
  useEffect(() => {
    function onStorage() {
      setTokens(tokenStorage.get());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Initial redirect logic
  useEffect(() => {
    if (!tokens?.accessToken || !tokens.refreshToken) {
      router.replace(loginPath);
      setBooting(false);
    } else {
      setBooting(false);
    }
  }, [tokens?.accessToken, tokens?.refreshToken, router, loginPath]);

  const value: AuthSessionValue = useMemo(
    () => ({
      accessToken: tokens?.accessToken || null,
      refreshToken: tokens?.refreshToken || null,
      decoded,
      userId,
      isTokenExpired,
      signOut,
      attemptRefresh,
      loading: booting,
      error: null,
    }),
    [
      tokens?.accessToken,
      tokens?.refreshToken,
      decoded,
      userId,
      isTokenExpired,
      signOut,
      attemptRefresh,
      booting,
    ]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
};

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx)
    throw new Error("useAuthSession must be used within <AuthSessionProvider>");
  return ctx;
}
