"use client";
import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/token-storage";

interface DecodedAccessToken {
  sub: string; // user id
  exp: number;
  iat?: number;
  roles?: string[]; // optional roles claim
  [k: string]: unknown;
}

interface SessionState {
  isAuthenticated: boolean;
  userId: string | null;
  roles: string[];
  decoded: DecodedAccessToken | null;
  accessToken: string | null;
}

function decodeJwt(token: string): DecodedAccessToken | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return json as DecodedAccessToken;
  } catch {
    return null;
  }
}

export function useAuthSession(): SessionState {
  const [state, setState] = useState<SessionState>(() => {
    const tokens = tokenStorage.get();
    const access = tokens?.accessToken || null;
    const decoded = access ? decodeJwt(access) : null;
    const now = Date.now() / 1000;
    const valid = decoded ? decoded.exp > now : false;
    return {
      isAuthenticated: !!access && valid,
      userId: decoded?.sub || null,
      roles: (decoded?.roles as string[] | undefined) || [],
      decoded: decoded,
      accessToken: access,
    };
  });

  useEffect(() => {
    function handleStorage() {
      const tokens = tokenStorage.get();
      const access = tokens?.accessToken || null;
      const decoded = access ? decodeJwt(access) : null;
      const now = Date.now() / 1000;
      const valid = decoded ? decoded.exp > now : false;
      setState({
        isAuthenticated: !!access && valid,
        userId: decoded?.sub || null,
        roles: (decoded?.roles as string[] | undefined) || [],
        decoded,
        accessToken: access,
      });
    }
    window.addEventListener("auth-tokens-changed", handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("auth-tokens-changed", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return state;
}
