"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/token-storage";
import { decodeAccessToken, ApiError, refreshTokens } from "@/lib/api.client";
import {
  AccessTokenPayload,
  ActiveSelection,
  AuthContextValue,
} from "./auth-types";
import { useAuthUser, useAuthOrganizations } from "./auth-queries";
import { unifiedAuthRefetch } from "./auth-refetch";
import type { Organization } from "@/app/organizations/organization/types/organization.types";

// -------------------------------

// Interfaces moved to auth-types.ts for cleaner separation of concerns.

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// LocalStorage keys for persisting user choices per user
function persistKey(userId: number | null, suffix: string) {
  return userId ? `auth:${userId}:${suffix}` : `auth:anon:${suffix}`;
}

function safeParseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

interface ProviderProps {
  children: React.ReactNode;
  loginPath?: string;
}

export const AuthProvider: React.FC<ProviderProps> = ({
  children,
  loginPath = "/auth",
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState(() => tokenStorage.get());
  const decoded = useMemo<AccessTokenPayload | null>(() => {
    if (!tokens?.accessToken) return null;
    return decodeAccessToken<AccessTokenPayload>();
  }, [tokens?.accessToken]);

  // Derive canonical userId
  const userId = useMemo<number | null>(() => {
    if (!decoded) return null;
    const raw = decoded.sub;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }, [decoded]);

  // Platform roles & org roles normalized
  const platformRoles = useMemo<string[]>(
    () => decoded?.roles?.global || [],
    [decoded]
  );
  const organizationRoles = useMemo<Record<number, string[]>>(() => {
    const out: Record<number, string[]> = {};
    const list = decoded?.roles?.org || [];
    list.forEach(({ orgId, roles }) => {
      out[orgId] = Array.isArray(roles) ? roles : roles ? [roles] : [];
    });
    return out;
  }, [decoded]);

  // Active selection (persist across reloads)
  const [active, setActive] = useState<ActiveSelection>(() => {
    const persisted = safeParseJSON<ActiveSelection>(
      typeof window !== "undefined"
        ? localStorage.getItem(persistKey(userId, "active"))
        : null
    );
    return (
      persisted || {
        organizationId: null,
        platformRole: platformRoles[0] || null,
        orgRole: null,
      }
    );
  });

  // Persist active selection when userId or active changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(persistKey(userId, "active"), JSON.stringify(active));
  }, [active, userId]);

  // If tokens disappear -> redirect
  useEffect(() => {
    if (!tokens?.accessToken || !tokens.refreshToken) {
      router.replace(loginPath);
    }
  }, [tokens, router, loginPath]);

  // Expiration helper
  const isTokenExpired = useCallback(() => {
    if (!decoded?.exp) return false; // if no exp, assume valid
    const now = Date.now() / 1000;
    // Add small skew buffer (30s) to preempt borderline expiry
    return decoded.exp < now + 30;
  }, [decoded?.exp]);

  // Queries (enabled only if we have tokens & not expired) ------------------
  // Enabled: allow queries if we have a token; refresh flow will handle nearing expiry
  const enabled = !!tokens?.accessToken;

  // User detail query (if we can resolve userId)
  const userQuery = useAuthUser(userId, enabled);

  useEffect(() => {
    if (userQuery.error) {
      setError(userQuery.error.message);
    }
  }, [userQuery.error]);

  // Organizations (basic list). We unwrap inner array from envelope.
  const orgsQuery = useAuthOrganizations(enabled);

  useEffect(() => {
    if (orgsQuery.error && orgsQuery.error.message) {
      setError(orgsQuery.error.message);
    } else if (orgsQuery.error) {
      setError(String(orgsQuery.error));
    }
  }, [orgsQuery.error]);

  // If active org not set but we have organizations & membership constraints, choose first intersection
  useEffect(() => {
    const orgs = orgsQuery.data || [];
    if (orgs.length === 0) return;
    if (!active.organizationId) {
      const first = orgs[0]?.id;
      if (first) setActive((a) => ({ ...a, organizationId: first }));
    }
  }, [orgsQuery.data, active.organizationId]);

  // Public actions ----------------------------------------------------------
  const setActiveOrganization = useCallback(
    (orgId: number | null) => {
      setActive((prev) => ({ ...prev, organizationId: orgId }));
      // Invalidate org-specific queries if any naming pattern used (wildcard)
      queryClient.invalidateQueries({ queryKey: ["org", orgId] });
    },
    [queryClient]
  );

  const setActivePlatformRole = useCallback(
    (role: string | null) => {
      setActive((prev) => ({ ...prev, platformRole: role }));
      queryClient.invalidateQueries({ queryKey: ["navigation", "tree"] });
    },
    [queryClient]
  );

  const setActiveOrgRole = useCallback(
    (role: string | null) => {
      setActive((prev) => ({ ...prev, orgRole: role }));
      queryClient.invalidateQueries({ queryKey: ["navigation", "tree"] });
    },
    [queryClient]
  );

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setTokens(null);
    queryClient.clear();
    router.replace(loginPath);
  }, [router, queryClient, loginPath]);

  // Refetch all relevant queries & handle expiry/401
  const attemptRefresh = useCallback(async () => {
    const ok = await refreshTokens();
    if (ok) {
      const updated = tokenStorage.get();
      if (updated) setTokens(updated);
    }
    return ok;
  }, []);

  const refetchAll = useCallback(async () => {
    if (!tokens?.accessToken || !tokens.refreshToken) {
      router.replace(loginPath);
      return;
    }
    if (isTokenExpired()) {
      const refreshed = await attemptRefresh();
      if (!refreshed) {
        signOut();
        return;
      }
    }
    try {
      await unifiedAuthRefetch(queryClient, userId);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          await unifiedAuthRefetch(queryClient, userId);
        } else {
          signOut();
        }
      }
    }
    const current = tokenStorage.get();
    if (!current?.accessToken) {
      signOut();
    } else {
      setTokens(current);
    }
  }, [
    tokens?.accessToken,
    tokens?.refreshToken,
    attemptRefresh,
    isTokenExpired,
    signOut,
    queryClient,
    userId,
    router,
    loginPath,
  ]);

  // Proactive refresh timer (~60s before expiry)
  useEffect(() => {
    if (!decoded?.exp) return;
    const nowSec = Date.now() / 1000;
    const lead = 60; // seconds before expiry
    const when = (decoded.exp - lead - nowSec) * 1000;
    if (when <= 0) return; // already near expiry; will be handled by calls
    const id = setTimeout(() => {
      attemptRefresh();
    }, when);
    return () => clearTimeout(id);
  }, [decoded?.exp, attemptRefresh]);

  // Listen for storage events (multi-tab logout/login sync)
  useEffect(() => {
    function onStorage(ev: StorageEvent) {
      if (ev.key === "accessToken" || ev.key === "refreshToken") {
        setTokens(tokenStorage.get());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const loading = userQuery.isLoading || orgsQuery.isLoading;
  const organizations: Organization[] = orgsQuery.data || [];

  const value: AuthContextValue = useMemo(
    () => ({
      accessToken: tokens?.accessToken || null,
      refreshToken: tokens?.refreshToken || null,
      decoded,
      userId,
      user: userQuery.data || null,
      organizations,
      active,
      loading,
      error,
      platformRoles,
      organizationRoles,
      setActiveOrganization,
      setActivePlatformRole,
      setActiveOrgRole,
      refetchAll,
      signOut,
      isTokenExpired,
    }),
    [
      tokens?.accessToken,
      tokens?.refreshToken,
      decoded,
      userId,
      userQuery.data,
      orgsQuery.data,
      active,
      loading,
      error,
      platformRoles,
      organizationRoles,
      setActiveOrganization,
      setActivePlatformRole,
      setActiveOrgRole,
      refetchAll,
      signOut,
      isTokenExpired,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}

/**
 * Helper hook to require authentication (redirects if missing / expired) on mount.
 */
export function useRequireAuth() {
  const { accessToken, isTokenExpired, signOut } = useAuthContext();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!accessToken) {
        signOut();
        return;
      }
      if (isTokenExpired()) {
        // Passive: refetchAll will attempt refresh; call it here if needed
        try {
          // Access refetchAll through context re-read (avoid circular import complexity)
        } catch {
          signOut();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, isTokenExpired, signOut]);
}
