"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function NavMainSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: 4 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton disabled>
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-24" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavProjectsSkeleton() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>آزمون‌های من</SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton disabled>
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-32" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function OrgSwitcherSkeleton() {
  return (
    <div className="px-2 py-1.5">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" disabled className="opacity-100">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="grid flex-1 gap-1 text-right">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function SiteHeaderSkeleton() {
  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-4 w-60 rounded" />
        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </header>
  );
}
