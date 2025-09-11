import type { LucideIcon } from "lucide-react";

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon | any; // allow dynamic fallback
  isActive?: boolean;
  items?: { title: string; url: string }[];
}

export interface SidebarProjectItem {
  name: string;
  url: string;
  icon: LucideIcon | any;
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
