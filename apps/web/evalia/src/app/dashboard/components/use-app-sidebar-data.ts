"use client";
import * as React from "react";
import { useOrgState } from "@/organizations/organization/context/org-context";
import { useUserDataContext } from "@/users/context/context";
import { useNavigationContext } from "@/navigation/context/navigation-context";

import { navSecondaryStatic } from "./sidebar-data/constants";
import type {
  AppSidebarData,
  OrgAccount,
  SidebarNavItem,
  SidebarProjectItem,
} from "./sidebar-data/types";
import { buildNavMain, buildProjects } from "./sidebar-data/builders";
import { OrgPlanEnum, OrgRoleEnum, OrganizationStatusEnum } from "@/lib/enums";

export function useAppSidebarData(): AppSidebarData {
  // Organizations
  const {
    organizations = [],
    activeOrganizationId,
    setActiveOrganization,
  } = useOrgState();
  const accounts: OrgAccount[] = organizations.map((org: unknown) => {
    // Defensive mapping: org may be unknown, so cast and check
    const o = org as Record<string, unknown>;
    const membership = o.membership as Record<string, unknown> | undefined;
    const plan = OrgPlanEnum.coerce(o.plan);
    const status = OrganizationStatusEnum.coerce(o.status);
    const rawRoles = Array.isArray(membership?.roles)
      ? (membership?.roles as unknown[])
      : [];
    const roles = rawRoles
      .map((r) => OrgRoleEnum.coerce(r))
      .filter(Boolean) as ReturnType<
      typeof OrgRoleEnum.coerce
    >[] as import("@/lib/enums").OrgRole[];
    return {
      id: o.id ? String(o.id) : "",
      name: o.name ? String(o.name) : "",
      slug: o.slug ? String(o.slug) : "",
      status: status || undefined,
      plan: plan || undefined,
      planLabel: plan ? OrgPlanEnum.t(plan) : undefined,
      logo: typeof o.logo === "string" ? (o.logo as string) : undefined,
      isPrimary: Boolean(o.isPrimary),
      roles,
      roleLabels: roles.map((r) => OrgRoleEnum.t(r)),
      membershipId:
        typeof membership?.membershipId === "number"
          ? (membership.membershipId as number)
          : undefined,
    };
  });
  const activeOrgId =
    activeOrganizationId != null ? String(activeOrganizationId) : undefined;
  const activeOrg = accounts.find((a) => a.id === activeOrgId);
  const selectOrg = React.useCallback(
    (id: string) => setActiveOrganization(Number(id)),
    [setActiveOrganization]
  );

  // User
  const { user } = useUserDataContext();
  // Normalize avatar so that:
  // - prefer backend-provided avatarUrl, otherwise fallback to avatar
  // - backend uploads like "/uploads/.." remain root-relative (hook resolves against API base)
  // - public/frontend assets or external links stay absolute to their origin
  // - missing values yield empty string so components render initials fallback instead of broken images
  const normalizeUserAvatar = React.useCallback((raw: unknown) => {
    const s = typeof raw === "string" ? raw.trim() : "";
    const val = s || "";
    if (/^https?:\/\//i.test(val)) return val; // already absolute
    // ensure leading slash for consistency
    const v = val.startsWith("/") ? val : "/" + val;
    // Backend uploads should stay root-relative so useAvatarImage resolves to API base
    if (v.startsWith("/uploads/")) return v;
    // Otherwise treat as frontend public asset path -> make absolute to frontend origin
    if (v && typeof window !== "undefined") {
      return window.location.origin.replace(/\/$/, "") + v;
    }
    // SSR fallback: return as-is; client will re-run and normalize to absolute
    return v;
  }, []);
  const navUser = user
    ? {
        name: typeof user.fullName === "string" ? user.fullName : "",
        email: typeof user.email === "string" ? user.email : "",
        avatar: normalizeUserAvatar(
          (user as any).avatarUrl ?? (user as any).avatar
        ),
        phoneNumber: typeof user.phone === "string" ? user.phone : undefined,
      }
    : undefined;

  // Navigation items
  const { items: navMainRaw = [], flatten } = useNavigationContext();
  const navMain: SidebarNavItem[] = buildNavMain(navMainRaw);
  const projects: SidebarProjectItem[] = buildProjects(flatten);

  return {
    accounts,
    activeOrgId,
    activeOrg,
    selectOrg,
    navMain,
    projects,
    navSecondary: navSecondaryStatic,
    navUser,
  };
}

export default useAppSidebarData;
