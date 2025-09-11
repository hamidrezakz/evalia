"use client";
import * as React from "react";
import { useOrgState } from "@/app/organizations/organization/context/org-context";
import { useUserDataContext } from "@/app/users/context/context";
import { useNavigationContext } from "@/app/navigation/context/navigation-context";

import { navSecondaryStatic } from "./sidebar-data/constants";
import type {
  AppSidebarData,
  OrgAccount,
  SidebarNavItem,
  SidebarProjectItem,
} from "./sidebar-data/types";
import { buildNavMain, buildProjects } from "./sidebar-data/builders";

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
    return {
      id: o.id ? String(o.id) : "",
      name: o.name ? String(o.name) : "",
      slug: o.slug ? String(o.slug) : "",
      plan: typeof o.plan === "string" ? (o.plan as string) : undefined,
      logo: typeof o.logo === "string" ? (o.logo as string) : undefined,
      isPrimary: Boolean(o.isPrimary),
      roles: Array.isArray(membership?.roles)
        ? (membership.roles as string[])
        : [],
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
  const navUser = user
    ? {
        name: typeof user.fullName === "string" ? user.fullName : "",
        email: typeof user.email === "string" ? user.email : "",
        avatar: typeof user.avatar === "string" ? user.avatar : "/avatars/default.png",
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
