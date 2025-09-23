"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../../app/auth/event-context";
import { useOrganizations } from "./queries";
import type { Organization } from "@/organizations/organization/types/organization.types";
import { PlatformRoleEnum, OrgRoleEnum } from "@/lib/enums";
import type { PlatformRole, OrgRole } from "@/lib/enums";
import type { OrgStateValue } from "./types";

const OrgContext = createContext<OrgStateValue | undefined>(undefined);

const ACTIVE_KEY = (userId: number | null) =>
  userId ? `org-active:${userId}` : "org-active:anon";

interface PersistedActive {
  organizationId: number | null;
  activeRole: PlatformRole | OrgRole | null; // unified role value
  activeRoleSource: "platform" | "organization" | null;
}

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userId, decoded, loading: sessionLoading } = useAuthSession();
  const platformRoles = useMemo<PlatformRole[]>(() => {
    const raw = decoded?.roles?.global || [];
    return (raw as unknown[])
      .map((r) => PlatformRoleEnum.coerce(r))
      .filter(Boolean) as PlatformRole[] as PlatformRole[];
  }, [decoded]);
  const organizationRolesMap = useMemo<Record<number, OrgRole[]>>(() => {
    const out: Record<number, OrgRole[]> = {};
    (decoded?.roles?.org || []).forEach((orgRole) => {
      if (
        typeof orgRole === "object" &&
        orgRole !== null &&
        "orgId" in orgRole &&
        "roles" in orgRole
      ) {
        const { orgId, roles } = orgRole as { orgId: number; roles: string[] };
        const norm = (Array.isArray(roles) ? roles : roles ? [roles] : [])
          .map((r) => OrgRoleEnum.coerce(r))
          .filter(Boolean) as OrgRole[] as OrgRole[];
        out[orgId] = norm;
      }
    });
    return out;
  }, [decoded]);

  const [active, setActive] = useState<PersistedActive>(() => {
    if (typeof window === "undefined") {
      return {
        organizationId: null,
        activeRole: platformRoles[0] || null,
        activeRoleSource: platformRoles[0] ? "platform" : null,
      };
    }
    try {
      const raw = localStorage.getItem(ACTIVE_KEY(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as {
          organizationId: number | null;
          activeRole: string | null;
          activeRoleSource: "platform" | "organization" | null;
        };
        let coerced: PlatformRole | OrgRole | null = null;
        if (parsed.activeRoleSource === "platform") {
          coerced = PlatformRoleEnum.coerce(parsed.activeRole);
        } else if (parsed.activeRoleSource === "organization") {
          coerced = OrgRoleEnum.coerce(parsed.activeRole);
        }
        return {
          organizationId: parsed.organizationId,
          activeRole: coerced,
          activeRoleSource: parsed.activeRoleSource,
        };
      }
    } catch {}
    return {
      organizationId: null,
      activeRole: platformRoles[0] || null,
      activeRoleSource: platformRoles[0] ? "platform" : null,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACTIVE_KEY(userId), JSON.stringify(active));
  }, [active, userId]);

  const orgsQuery = useOrganizations(!!decoded);

  useEffect(() => {
    const orgs = orgsQuery.data || [];
    if (orgs.length === 0) return;
    if (!active.organizationId) {
      const first = orgs[0]?.id;
      if (first) setActive((a) => ({ ...a, organizationId: first }));
    }
  }, [orgsQuery.data, active.organizationId]);

  const queryClient = useQueryClient();
  const setActiveOrganization = useCallback(
    (orgId: number | null) => {
      setActive((prev) => {
        let newActiveRole = prev.activeRole;
        let newActiveRoleSource = prev.activeRoleSource;
        // If previous role was organization role, check if it exists in new org
        if (prev.activeRoleSource === "organization" && orgId) {
          const orgRoles = organizationRolesMap[orgId] || [];
          const prevOrgRole = (prev.activeRole as OrgRole) || null;
          if (!prevOrgRole || !orgRoles.includes(prevOrgRole)) {
            newActiveRole = orgRoles[0] || null;
            newActiveRoleSource = newActiveRole ? "organization" : null;
          }
        }
        return {
          ...prev,
          organizationId: orgId,
          activeRole: newActiveRole,
          activeRoleSource: newActiveRoleSource,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["org", orgId] });
    },
    [queryClient, organizationRolesMap]
  );

  const setPlatformActiveRole = useCallback(
    (role: PlatformRole | null) => {
      setActive((prev) => ({
        ...prev,
        activeRole: role,
        activeRoleSource: role ? "platform" : null,
      }));
      queryClient.invalidateQueries({ queryKey: ["navigation", "tree"] });
    },
    [queryClient]
  );

  const setOrganizationActiveRole = useCallback(
    (role: OrgRole | null, orgId?: number | null) => {
      setActive((prev) => ({
        ...prev,
        activeRole: role,
        activeRoleSource: role ? "organization" : null,
        organizationId: orgId !== undefined ? orgId : prev.organizationId,
      }));
      queryClient.invalidateQueries({ queryKey: ["navigation", "tree"] });
    },
    [queryClient]
  );

  const refreshOrganizations = useCallback(async () => {
    await orgsQuery.refetch();
  }, [orgsQuery]);

  const value: OrgStateValue = useMemo(
    () => ({
      organizations: (orgsQuery.data as Organization[]) || [],
      organizationRoles: organizationRolesMap,
      platformRoles,
      activeOrganizationId: active.organizationId,
      activeRole: active.activeRole,
      activeRoleSource: active.activeRoleSource,
      loading: sessionLoading || orgsQuery.isLoading,
      error: orgsQuery.error ? String(orgsQuery.error) : null,
      setActiveOrganization,
      setPlatformActiveRole,
      setOrganizationActiveRole,
      refreshOrganizations,
    }),
    [
      orgsQuery.data,
      organizationRolesMap,
      platformRoles,
      active,
      sessionLoading,
      orgsQuery.isLoading,
      orgsQuery.error,
      setActiveOrganization,
      setPlatformActiveRole,
      setOrganizationActiveRole,
      refreshOrganizations,
    ]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export function useOrgState() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrgState must be used inside <OrgProvider>");
  return ctx;
}
