"use client";

import { memo, useCallback, useMemo } from "react";
import { useOrgState } from "@/app/organizations/organization/context/org-context";
import type { OrgAccount as SidebarOrgAccount } from "./sidebar-data/types";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronDown,
  Plus,
  Star,
  Settings2,
  Check,
  Command,
} from "lucide-react";

// Re-export OrgAccount type (subset from use-app-sidebar-data)
export type OrgAccount = SidebarOrgAccount;

export interface OrgSwitcherProps {
  accounts: OrgAccount[];
  activeOrgId?: string;
  activeOrg?: OrgAccount | null;
  onSelect: (id: string) => void;
  className?: string;
}

const planColor = (plan?: string | null) => {
  switch (plan?.toLowerCase()) {
    case "enterprise":
      return "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300";
    case "pro":
      return "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300";
    case "standard":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const OrgSwitcher = memo(function OrgSwitcher({
  accounts,
  activeOrgId,
  activeOrg,
  onSelect,
  className = "",
}: OrgSwitcherProps) {
  const {
    platformRoles,
    organizationRoles,
    activeRole,
    activeRoleSource,
    setPlatformActiveRole,
    setOrganizationActiveRole,
    activeOrganizationId,
  } = useOrgState();

  const orgRoles: string[] = useMemo(
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

  const handlePlatformRole = useCallback(
    (role: string) => () => setPlatformActiveRole(role),
    [setPlatformActiveRole]
  );

  const handleOrgRole = useCallback(
    (role: string) => () =>
      setOrganizationActiveRole(role, activeOrganizationId),
    [setOrganizationActiveRole, activeOrganizationId]
  );

  const { isMobile } = useSidebar();

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="تغییر سازمان فعال"
          className={`flex w-full items-center gap-2 rounded-md text-right focus:outline-none ${className}`}>
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg border border-border/40 shadow-sm">
            {activeOrg?.logo ? (
              <Avatar className="size-10 rounded-full shadow-md">
                <AvatarImage src={activeOrg.logo} alt={activeOrg.name} />
                <AvatarFallback className="rounded-md text-xs font-medium text-primary">
                  {activeOrg.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : activeOrg ? (
              <Command className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-right leading-tight">
            <span className="truncate font-semibold text-sm">
              {activeOrg?.name ||
                (accounts.length === 0 ? "بدون سازمان" : "انتخاب سازمان")}
            </span>
            <span className="truncate text-[0.60rem] text-muted-foreground flex items-center gap-1 justify-start">
              {activeOrg?.plan ? (
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.55rem] font-medium shadow-sm ${planColor(
                    activeOrg.plan
                  )}`}>
                  {activeOrg.isPrimary && (
                    <Star className="size-3 mb-0.5 fill-current" />
                  )}
                  {activeOrg.plan}
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
        className="w-75 rounded-lg mr--2 sm:mr--4">
        <DropdownMenuLabel className="text-xs tracking-wide text-muted-foreground flex items-center justify-between">
          <span>سازمان‌های من</span>
          <span className="text-[0.6rem] font-normal text-muted-foreground/70">
            {accounts.length === 0
              ? "بدون سازمان"
              : `${accounts.length} سازمان`}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {accounts.map((acc) => {
            const isActive = acc.id === activeOrgId;
            return (
              <DropdownMenuItem
                key={acc.id}
                onClick={handleSelect(acc.id)}
                className="gap-2 cursor-pointer group"
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
                    <span className="text-[12px] font-medium flex items-center gap-1">
                      {acc.name}
                      {acc.isPrimary && (
                        <Star
                          className="size-3 text-amber-500"
                          aria-label="اصلی"
                        />
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {acc.plan || "Standard"}
                    </span>
                  </div>
                </div>
                {isActive && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        {(platformRoles.length > 0 || orgRoles.length > 0) && (
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
                      <Badge
                        key={r}
                        variant={active ? "default" : "outline"}
                        className={`cursor-pointer text-[0.64rem]`}
                        onClick={() => setPlatformActiveRole(r)}
                        aria-pressed={active}>
                        {r}
                      </Badge>
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
                      <Badge
                        key={r}
                        variant={active ? "default" : "outline"}
                        className={`cursor-pointer text-[0.64rem]`}
                        onClick={() =>
                          setOrganizationActiveRole(r, activeOrganizationId)
                        }
                        aria-pressed={active}>
                        {r}
                      </Badge>
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
        <DropdownMenuItem className="gap-2 mt-0.5 text-[0.8rem]">
          <Plus className="size-4" />
          افزودن حساب جدید
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-[0.8rem] mb-0.5">
          <Settings2 className="size-4" />
          مدیریت حساب‌ها و تنظیمات
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

OrgSwitcher.displayName = "OrgSwitcher";
