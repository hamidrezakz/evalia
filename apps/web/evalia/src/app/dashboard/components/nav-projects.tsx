"use client";
import React from "react";

import { Folder, MoreHorizontal, Share, Trash2 } from "lucide-react";
import type { SidebarProjectItem } from "./sidebar-data/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAssessmentUserSessions } from "@/assessment/context/assessment-user-sessions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SessionStateEnum, ResponsePerspectiveEnum } from "@/lib/enums";
import { useRouter } from "next/navigation";

export function NavProjects(props: { projects?: SidebarProjectItem[] }) {
  const { projects = [] } = props;
  const { isMobile } = useSidebar();
  const router = useRouter();
  const {
    sessions,
    loading,
    error,
    activeSessionId,
    setActiveSessionId,
    availablePerspectives,
    activePerspective,
    setActivePerspective,
  } = useAssessmentUserSessions();

  // Prevent hydration mismatch: render a stable placeholder on SSR/initial mount
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>آزمون‌های من</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="w-3 h-3 rounded-full bg-muted-foreground/40 animate-pulse" />
              <span>در حال بارگذاری…</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>آزمون‌های من</SidebarGroupLabel>
      <SidebarMenu>
        {/* User sessions list */}
        {loading ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="w-3 h-3 rounded-full bg-muted-foreground/40 animate-pulse" />
              <span>در حال بارگذاری…</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : error ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="text-rose-600">خطا در دریافت آزمون‌ها</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : sessions.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span>آزمونی یافت نشد</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          sessions.map((s) => (
            <SidebarMenuItem key={s.id}>
              <SidebarMenuButton
                isActive={activeSessionId === s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  router.push("/dashboard/tests/take");
                }}>
                <Folder />
                <span className="truncate text-[12px] font-semibold">
                  {s.name}
                </span>
                <span className="ms-auto flex items-center gap-2 w-fit min-w-fit">
                  {/* Status badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium",
                      s.state === "IN_PROGRESS"
                        ? "border-amber-500 text-amber-700"
                        : s.state === "COMPLETED"
                        ? "border-emerald-500 text-emerald-700"
                        : s.state === "CANCELLED"
                        ? "border-rose-500 text-rose-700"
                        : s.state === "ANALYZING"
                        ? "border-sky-500 text-sky-700"
                        : "border-muted-foreground/40 text-muted-foreground"
                    )}>
                    {SessionStateEnum.t(
                      s.state as any as (typeof SessionStateEnum.values)[number]
                    )}
                  </Badge>
                </span>
              </SidebarMenuButton>
              {/* Actions: choose perspective */}
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}>
                  <DropdownMenuItem disabled className="opacity-60">
                    <span>پرسپکتیوهای ثبت‌شده</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {s.perspectives.map((p) => (
                    <DropdownMenuItem key={p} disabled>
                      <span>{ResponsePerspectiveEnum.t(p as any)}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}

        {/* Optional: legacy projects below */}
        {projects.length > 0 && (
          <>
            <SidebarGroupLabel className="mt-3">Projects</SidebarGroupLabel>
            {projects.map((item: SidebarProjectItem) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    {typeof item.icon === "function" ? (
                      <item.icon />
                    ) : (
                      React.createElement(item.icon)
                    )}
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
