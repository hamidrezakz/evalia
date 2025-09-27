"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthSession } from "@/app/auth/event-context/session-context";
import { formatIranPhone } from "@/lib/utils";
import * as React from "react";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveApiBase } from "@/lib/api/helpers";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    phoneNumber?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { signOut } = useAuthSession();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const initials = React.useMemo(
    () =>
      (user?.name || "?")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase(),
    [user?.name]
  );
  const { src: hookSrc } = useAvatarImage(user?.avatar);
  // Extra safety: build a direct absolute URL in case hookSrc is empty
  const directSrc = React.useMemo(() => {
    const raw = user?.avatar || "";
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw; // absolute
    const v = raw.startsWith("/") ? raw : "/" + raw;
    if (v.startsWith("/uploads/")) return resolveApiBase() + v; // backend asset
    if (typeof window !== "undefined") {
      return window.location.origin.replace(/\/$/, "") + v; // frontend public asset
    }
    return v;
  }, [user?.avatar]);
  const avatarUrl = hookSrc || directSrc || "";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // signOut already clears tokens, cache & redirects
      await Promise.resolve(signOut());
    } finally {
      // If redirect happens this won't matter; defensive reset
      setLoggingOut(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-right text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
                {user.phoneNumber && (
                  <span className="truncate text-xs text-muted-foreground">
                    {formatIranPhone(user.phoneNumber)}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            {" "}
            <DropdownMenuLabel className="p-0 font-normal flex">
              <div className="flex items-center gap-2 px-1 py-1.5 text-right text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-[12px] leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  router.push("/dashboard");
                }}
                className="cursor-pointer">
                <BadgeCheck />
                پروفایل
              </DropdownMenuItem>
              {/* Removed change password item per latest request */}
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  router.push("/dashboard/support");
                }}
                className="cursor-pointer">
                <Bell />
                پشتیبانی
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  router.push("/dashboard/feedback");
                }}
                className="cursor-pointer">
                <Sparkles />
                ارسال بازخورد
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="cursor-pointer text-red-600 focus:text-red-700"
              disabled={loggingOut}>
              <LogOut className={loggingOut ? "animate-pulse" : ""} />
              {loggingOut ? "در حال خروج…" : "خروج از حساب کاربری"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
