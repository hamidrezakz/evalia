"use client";

import * as React from "react";
// Note: Command icon no longer used directly here after extraction

import { NavMain } from "@/app/dashboard/components/nav-main";
import { NavProjects } from "@/app/dashboard/components/nav-projects";
import { NavSecondary } from "@/app/dashboard/components/nav-secondary";
import { NavUser } from "@/app/dashboard/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useAppSidebarData from "./use-app-sidebar-data";
import { OrgSwitcher } from "@/app/dashboard/components/org-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    accounts,
    activeOrgId,
    activeOrg,
    selectOrg,
    navMain,
    projects,
    navSecondary,
    navUser,
  } = useAppSidebarData();

  return (
    <Sidebar
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! right-[fix]"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="px-2">
              <OrgSwitcher
                accounts={accounts}
                activeOrgId={activeOrgId}
                onSelect={selectOrg}
                activeOrg={activeOrg}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter dir="ltr">
        {navUser && (
          <NavUser
            user={{
              ...navUser,
              email: navUser.email ?? "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

// OrgSwitcher extracted to separate component
