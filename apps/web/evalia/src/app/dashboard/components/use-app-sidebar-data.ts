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
  const accounts: OrgAccount[] = organizations.map((org: any) => ({
    id: String(org.id),
    name: org.name,
    slug: org.slug,
    plan: org.plan,
    logo: org.logo,
    isPrimary: org.isPrimary,
    roles: org.membership?.roles ?? [],
    membershipId: org.membership?.membershipId,
  }));
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
        name: user.fullName ?? "",
        email: user.email,
        avatar: user.avatar || "/avatars/default.png",
        phoneNumber: user.phone,
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
