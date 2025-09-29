"use client";

import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { OrgSwitcherSkeleton } from "./sidebar-skeletons";
import { useOrgState } from "@/organizations/organization/context/org-context";
import type { OrgAccount as SidebarOrgAccount } from "./sidebar-data/types";
// Removed unused enums (PlatformRoleEnum, OrgRoleEnum) for cleanliness
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import {
  OrganizationStatusBadge,
  PlatformRoleBadge,
  OrgRoleBadge,
  OrgPlanBadge,
} from "@/components/status-badges";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronDown,
  Plus,
  Star,
  Check,
  Command,
  LogOut,
  Home,
} from "lucide-react";
import { useAuthSession } from "@/app/auth/event-context/session-context";
import { useRouter } from "next/navigation";

// Re-export OrgAccount type (subset from use-app-sidebar-data)
export type OrgAccount = SidebarOrgAccount;

export interface OrgSwitcherProps {
  accounts: OrgAccount[];
  activeOrgId?: string;
  activeOrg?: OrgAccount | null;
  onSelect: (id: string) => void;
  className?: string;
}

// plan badge is handled by OrgPlanBadge

export const OrgSwitcher = memo(function OrgSwitcher({
  accounts,
  activeOrgId,
  activeOrg,
  onSelect,
  className = "",
}: OrgSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Always call hooks (including context) regardless of mount state to keep hook order stable
  const {
    platformRoles,
    organizationRoles,
    activeRole,
    activeRoleSource,
    setPlatformActiveRole,
    setOrganizationActiveRole,
    activeOrganizationId,
  } = useOrgState();
  const { signOut } = useAuthSession();
  const router = useRouter();

  const orgRoles = useMemo(
    () =>
      activeOrganizationId ? organizationRoles[activeOrganizationId] || [] : [],
    [organizationRoles, activeOrganizationId]
  );

  const handleSelect = useCallback(
    (id: string) => () => {
      onSelect(id);
    },
    [onSelect]
  );

  const { isMobile } = useSidebar();

  // Sort organizations: primary first, then active, then alpha
  const orderedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      if (a.id === activeOrgId && b.id !== activeOrgId) return -1;
      if (b.id === activeOrgId && a.id !== activeOrgId) return 1;
      return a.name.localeCompare(b.name, "fa");
    });
  }, [accounts, activeOrgId]);

  const renderOrgRow = useCallback(
    (acc: OrgAccount) => {
      const isActive = acc.id === activeOrgId;
      return (
        <DropdownMenuItem
          key={acc.id}
          onClick={handleSelect(acc.id)}
          className="gap-2 cursor-pointer group pr-2"
          data-active={isActive}
          aria-current={isActive ? "true" : undefined}>
          <div className="flex items-center gap-2">
            <Avatar className="size-8 rounded-md border border-border/40 ring-0 group-data-[active=true]:ring-2 group-data-[active=true]:ring-primary/40 transition">
              {acc.logo && <AvatarImage src={acc.logo} alt={acc.name} />}
              <AvatarFallback className="rounded-md text-[10px] font-medium">
                {acc.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[12px] font-medium flex items-center mt-0.5 gap-1">
                {acc.name}
                {acc.status && (
                  <span className="mt-[2px] inline-flex">
                    <OrganizationStatusBadge
                      status={acc.status as OrgAccount["status"]}
                      tone="soft"
                      size="xs"
                    />
                  </span>
                )}
                {acc.isPrimary && (
                  <Star
                    className="size-3 text-amber-500"
                    aria-label="سازمان اصلی"
                  />
                )}
              </span>
              <span className="text-[10px] mt-0.5 text-muted-foreground inline-flex items-center gap-1">
                {acc.plan ? (
                  <span className="mt-[2px] inline-flex">
                    <OrgPlanBadge
                      plan={acc.plan as OrgAccount["plan"]}
                      size="xs"
                      tone="soft"
                    />
                  </span>
                ) : (
                  <span>بدون پلن</span>
                )}
              </span>
            </div>
          </div>
          {isActive && <Check className="ms-auto size-4 text-primary" />}
        </DropdownMenuItem>
      );
    },
    [activeOrgId, handleSelect]
  );

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="تغییر سازمان فعال"
          className={`group flex w-full items-center gap-2 rounded-md text-right focus:outline-none px-2 py-1.5 transition border border-transparent hover:border-border/60 hover:bg-muted/40 data-[state=open]:bg-muted/50 data-[state=open]:border-border/60 ${className}`}>
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg border border-border/40 shadow-sm group-data-[state=open]:ring-2 group-data-[state=open]:ring-primary/30">
            {!mounted ? (
              <span className="inline-block w-full h-full animate-pulse rounded-md bg-muted" />
            ) : activeOrg?.logo ? (
              <Avatar className="size-8 rounded-md">
                <AvatarImage src={activeOrg.logo} alt={activeOrg.name} />
                <AvatarFallback className="rounded-md text-xs font-medium text-primary/80">
                  {activeOrg.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : activeOrg ? (
              <Command className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-right leading-tight min-w-0">
            <span className="truncate font-semibold text-[13px] flex items-center gap-1">
              {!mounted
                ? "..."
                : activeOrg?.name ||
                  (accounts.length === 0 ? "بدون سازمان" : "انتخاب سازمان")}
              {mounted && activeOrg?.status && (
                <span className="mt-[2px] inline-flex">
                  <OrganizationStatusBadge
                    status={activeOrg.status as OrgAccount["status"]}
                    tone="soft"
                    size="xs"
                  />
                </span>
              )}
            </span>
            <span className="truncate text-[0.60rem] text-muted-foreground flex items-center gap-1 justify-start">
              {!mounted ? (
                <span className="inline-flex w-14 h-3 rounded bg-muted animate-pulse" />
              ) : activeOrg?.plan ? (
                <span className="inline-flex items-center gap-1">
                  {activeOrg.isPrimary && (
                    <Star
                      className="size-3 mb-0.5 text-amber-500"
                      aria-label="سازمان اصلی"
                    />
                  )}
                  <span className="mt-[2px] inline-flex">
                    <OrgPlanBadge
                      plan={activeOrg.plan as OrgAccount["plan"]}
                      size="xs"
                      tone="soft"
                    />
                  </span>
                </span>
              ) : accounts.length === 0 ? (
                <span className="text-[0.55rem] text-muted-foreground">
                  عضو هیچ سازمانی نیستید
                </span>
              ) : (
                <span className="text-[0.55rem] text-muted-foreground">
                  بدون پلن سازمانی
                </span>
              )}
            </span>
          </div>
          <ChevronDown className="size-4 opacity-70 transition group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align="start"
        className="w-[320px] rounded-lg mr--2 sm:mr--4 p-0 overflow-hidden">
        {!mounted ? (
          <div className="p-3 text-[11px] text-muted-foreground">
            در حال بارگذاری...
          </div>
        ) : (
          <DropdownMenuLabel className="text-xs tracking-wide text-muted-foreground flex items-center justify-between">
            <span>سازمان‌های من</span>
            <span className="text-[0.6rem] font-normal text-muted-foreground/70">
              {accounts.length === 0
                ? "بدون سازمان"
                : `${accounts.length} سازمان`}
            </span>
          </DropdownMenuLabel>
        )}
        {mounted && (
          <DropdownMenuGroup>
            {orderedAccounts.map(renderOrgRow)}
          </DropdownMenuGroup>
        )}
        {mounted && (platformRoles.length > 0 || orgRoles.length > 0) && (
          <>
            <DropdownMenuSeparator />
            {platformRoles.length > 0 && (
              <div className="px-2 py-1.5">
                <div className="text-[0.55rem] font-medium text-muted-foreground mb-1 tracking-wide">
                  نقش‌های پلتفرمی
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {platformRoles.map((r) => {
                    const active =
                      activeRoleSource === "platform" && activeRole === r;
                    return (
                      <PlatformRoleBadge
                        key={r}
                        role={r as any}
                        active={active}
                        size="xs"
                        tone={active ? "solid" : "soft"}
                        className="cursor-pointer"
                        as="button"
                        onClick={() => setPlatformActiveRole(r)}
                        aria-pressed={active}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {orgRoles.length > 0 ? (
              <div className="px-2 py-1.5">
                <div className="text-[0.55rem] font-medium text-muted-foreground mb-1 tracking-wide">
                  نقش‌های سازمانی
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {orgRoles.map((r) => {
                    const active =
                      activeRoleSource === "organization" && activeRole === r;
                    return (
                      <OrgRoleBadge
                        key={r}
                        role={r as any}
                        active={active}
                        size="xs"
                        tone={active ? "solid" : "soft"}
                        className="cursor-pointer"
                        as="button"
                        onClick={() =>
                          setOrganizationActiveRole(r, activeOrganizationId)
                        }
                        aria-pressed={active}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="px-2 py-1.5 text-[0.6rem] text-muted-foreground">
                عضو هیچ سازمانی نیستید یا نقش سازمانی ندارید
              </div>
            )}
          </>
        )}
        <DropdownMenuSeparator />
        {mounted && (
          <>
            <DropdownMenuItem
              className="gap-2 mt-0.5 text-[0.8rem] cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                router.push("/auth");
              }}>
              <Plus className="size-4" />
              افزودن / اتصال حساب
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-[0.8rem] cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                router.push("/");
              }}>
              <Home className="size-4" />
              صفحه اصلی سایت
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-[0.8rem] mb-0.5 cursor-pointer text-red-600 focus:text-red-700"
              onSelect={(e) => {
                e.preventDefault();
                signOut();
              }}>
              <LogOut className="size-4" />
              خروج از حساب کاربری
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

OrgSwitcher.displayName = "OrgSwitcher";
