"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, refreshTokens } from "@/lib/api.client";
import { unifiedAuthRefetch } from "../auth-refetch";
import { useAuthUser, useAuthOrganizations } from "../auth-queries";
import type { Organization } from "@/app/organizations/organization/types/organization.types";
import type {
  AccessTokenPayload,
  ActiveSelection,
  AuthContextValue,
} from "../auth-types";
import { AuthContext } from "./context-core";
import {
  tokenStorage,
  decodeToken,
  persistKey,
  safeParseJSON,
} from "./auth-utils";

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
  const decoded = useMemo<AccessTokenPayload | null>(
    () => decodeToken(tokens?.accessToken || null),
    [tokens?.accessToken]
  );

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

  const platformRoles = useMemo<string[]>(
    () => decoded?.roles?.global || [],
    [decoded]
  );
  const organizationRoles = useMemo<Record<number, string[]>>(() => {
    const out: Record<number, string[]> = {};
    (decoded?.roles?.org || []).forEach(({ orgId, roles }) => {
      out[orgId] = Array.isArray(roles) ? roles : roles ? [roles] : [];
    });
    return out;
  }, [decoded]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(persistKey(userId, "active"), JSON.stringify(active));
  }, [active, userId]);
  useEffect(() => {
    if (!tokens?.accessToken || !tokens.refreshToken) {
      router.replace(loginPath);
    }
  }, [tokens, router, loginPath]);

  const isTokenExpired = useCallback(() => {
    if (!decoded?.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp < now + 30;
  }, [decoded?.exp]);
  const enabled = !!tokens?.accessToken;
  const userQuery = useAuthUser(userId, enabled);
  useEffect(() => {
    if (userQuery.error) setError(userQuery.error.message);
  }, [userQuery.error]);
  const orgsQuery = useAuthOrganizations(enabled);
  useEffect(() => {
    if (orgsQuery.error && orgsQuery.error.message)
      setError(orgsQuery.error.message);
    else if (orgsQuery.error) setError(String(orgsQuery.error));
  }, [orgsQuery.error]);
  useEffect(() => {
    const orgs = orgsQuery.data || [];
    if (orgs.length === 0) return;
    if (!active.organizationId) {
      const first = orgs[0]?.id;
      if (first) setActive((a) => ({ ...a, organizationId: first }));
    }
  }, [orgsQuery.data, active.organizationId]);

  const setActiveOrganization = useCallback(
    (orgId: number | null) => {
      setActive((prev) => ({ ...prev, organizationId: orgId }));
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

  useEffect(() => {
    if (!decoded?.exp) return;
    const nowSec = Date.now() / 1000;
    const lead = 60;
    const when = (decoded.exp - lead - nowSec) * 1000;
    if (when <= 0) return;
    const id = setTimeout(() => {
      attemptRefresh();
    }, when);
    return () => clearTimeout(id);
  }, [decoded?.exp, attemptRefresh]);
  useEffect(() => {
    function onStorage() {
      setTokens(tokenStorage.get());
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
