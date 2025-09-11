import React from "react";
import type { LucideIcon } from "lucide-react";

// Allow only LucideIcon or a lazy/forward ref React component returning an SVG
// Icon component type: either a LucideIcon (already a React component) or any functional component returning a React element
// Using unknown for props keeps flexibility while avoiding 'any'
export type SidebarIconComponent = LucideIcon | ((props: unknown) => React.ReactElement);

export interface SidebarNavItemChild {
  title: string;
  url: string;
}

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: SidebarIconComponent;
  isActive?: boolean;
  items?: SidebarNavItemChild[];
}

export interface SidebarProjectItem {
  name: string;
  url: string;
  icon: SidebarIconComponent;
}

export interface OrgAccount {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  logo?: string;
  isPrimary?: boolean;
  roles?: string[];
  membershipId?: number;
}

export interface AppSidebarUser {
  name: string;
  email?: string;
  avatar: string;
  phoneNumber?: string;
}

export interface AppSidebarData {
  accounts: OrgAccount[];
  activeOrgId?: string;
  activeOrg?: OrgAccount;
  selectOrg: (id: string) => void;
  navMain: SidebarNavItem[];
  projects: SidebarProjectItem[];
  navSecondary: SidebarNavItem[];
  navUser?: AppSidebarUser;
}
