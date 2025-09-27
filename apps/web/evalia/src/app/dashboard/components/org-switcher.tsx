"use client";

import { memo, useCallback, useMemo } from "react";
import { useOrgState } from "@/organizations/organization/context/org-context";
import type { OrgAccount as SidebarOrgAccount } from "./sidebar-data/types";
import { PlatformRoleEnum, OrgRoleEnum } from "@/lib/enums";
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

// plan badge is handled by OrgPlanBadge

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
            <span className="truncate font-semibold text-sm flex items-center gap-1">
              {activeOrg?.name ||
                (accounts.length === 0 ? "بدون سازمان" : "انتخاب سازمان")}
              {activeOrg?.status && (
                <OrganizationStatusBadge
                  status={activeOrg.status as any}
                  tone="soft"
                  size="xs"
                />
              )}
            </span>
            <span className="truncate text-[0.60rem] text-muted-foreground flex items-center gap-1 justify-start">
              {activeOrg?.plan ? (
                <span className="inline-flex items-center gap-1">
                  {activeOrg.isPrimary && (
                    <Star className="size-3 mb-0.5 text-amber-500" />
                  )}
                  <OrgPlanBadge
                    plan={activeOrg.plan as any}
                    size="xs"
                    tone="soft"
                  />
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
                    <span className="text-[12px] font-medium flex items-center mt-0.5 gap-1">
                      {acc.name}
                      {acc.status && (
                        <OrganizationStatusBadge
                          status={acc.status as any}
                          tone="soft"
                          size="xs"
                        />
                      )}
                      {acc.isPrimary && (
                        <Star
                          className="size-3 text-amber-500"
                          aria-label="اصلی"
                        />
                      )}
                    </span>
                    <span className="text-[10px] mt-0.5 text-muted-foreground inline-flex items-center gap-1">
                      {acc.plan ? (
                        <OrgPlanBadge
                          plan={acc.plan as any}
                          size="xs"
                          tone="soft"
                        />
                      ) : (
                        <span>بدون پلن</span>
                      )}
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
