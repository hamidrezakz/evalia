"use client";
import * as React from "react";
import { useAuthSession } from "@/app/auth/event-context/session-context";
import { useUser } from "@/users/api/users-hooks";
import { useUserOrganizations } from "@/organizations/organization/api/organization-hooks";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { parseJalali, formatJalali } from "@/lib/jalali-date";
import { cn } from "@/lib/utils";
import {
  Users2,
  Building2,
  Layers,
  Crown,
  RefreshCcw,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ----------------------------------
// Utility components
// ----------------------------------
function UserStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const norm = status.toUpperCase();
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: {
      label: "فعال",
      cls: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    },
    SUSPENDED: {
      label: "معلق",
      cls: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    },
    DISABLED: {
      label: "غیرفعال",
      cls: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
    },
  };
  const meta = map[norm] || {
    label: status,
    cls: "bg-muted text-muted-foreground border-muted-foreground/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[10px] font-medium",
        meta.cls
      )}>
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            "absolute inset-0 rounded-full",
            norm === "ACTIVE"
              ? "bg-emerald-500"
              : norm === "SUSPENDED"
              ? "bg-amber-500"
              : norm === "DISABLED"
              ? "bg-rose-500"
              : "bg-muted-foreground"
          )}
        />
      </span>
      {meta.label}
    </span>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/40 px-3 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-1 text-right" dir="rtl">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        {loading ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <span className="text-sm font-semibold tabular-nums">{value}</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardLandingPage() {
  const { userId } = useAuthSession();
  const userQuery = useUser(userId);
  const orgsQuery = useUserOrganizations(!!userId);
  const loading = userQuery.isLoading || orgsQuery.isLoading;
  const user = userQuery.data as any;
  const orgs = (orgsQuery.data as any[]) || [];

  // Derive stats
  const totalOrgs = orgs.length;
  // Collect roles (flatten) for selector
  const collectedRoles: string[] = [];
  orgs.forEach((o) => {
    if (Array.isArray(o.membership?.roles)) {
      o.membership.roles.forEach((r: string) => {
        if (!collectedRoles.includes(r)) collectedRoles.push(r);
      });
    }
  });
  collectedRoles.sort();
  const [activeRoleFilter, setActiveRoleFilter] = React.useState<string | null>(
    null
  );

  // Placeholder test stats (would come from API in future)
  const totalTests = 12; // total created tests (placeholder)
  const participatedTests = 7; // tests user participated in (placeholder)
  const completionRate = totalTests
    ? Math.round((participatedTests / totalTests) * 100)
    : 0;

  const createdAt = user?.createdAt;
  let createdAtPretty: string | null = null;
  if (createdAt) {
    try {
      createdAtPretty = formatJalali(parseJalali(createdAt));
    } catch {
      createdAtPretty = null;
    }
  }

  const avatarUrl = user?.avatarUrl || user?.avatar;
  const fullName =
    user?.fullName || user?.name || user?.email || `کاربر #${userId}`;
  const initials = fullName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase();

  // Active organization (placeholder: pick first org) & updated time
  const activeOrg = orgs[0];
  const updatedAt = user?.updatedAt || user?.lastUpdatedAt;
  let updatedAtPretty: string | null = null;
  if (updatedAt) {
    try {
      updatedAtPretty = formatJalali(parseJalali(updatedAt), true);
    } catch {
      updatedAtPretty = null;
    }
  }

  return (
    <div className=" pb-10 flex flex-col gap-6" dir="rtl">
      {/* Header */}
      <Panel>
        <PanelHeader className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="flex items-center gap-4 md:gap-6">
            <Avatar className="h-20 w-20 rounded-2xl border shadow-sm">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
              <AvatarFallback className="rounded-2xl text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 text-right">
              <PanelTitle className="flex items-center flex-wrap gap-3 text-lg font-semibold leading-6">
                <span>{fullName}</span>
                <UserStatusBadge status={user?.status} />
                {activeOrg && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {activeOrg.name}
                  </span>
                )}
              </PanelTitle>
              <PanelDescription className="text-[11px] flex flex-wrap gap-4 items-center">
                {createdAtPretty && (
                  <span className="inline-flex items-center gap-1">
                    <span className="opacity-60">ایجاد:</span>
                    <span className="font-medium">{createdAtPretty}</span>
                  </span>
                )}
                {updatedAtPretty && (
                  <span className="inline-flex items-center gap-1">
                    <RefreshCcw className="h-3 w-3 opacity-60" />
                    <span className="opacity-60">آپدیت:</span>
                    <span className="font-medium">{updatedAtPretty}</span>
                  </span>
                )}
                {user?.email && (
                  <span className="inline-flex items-center gap-1 ltr:font-mono">
                    <span className="opacity-60">ایمیل:</span>
                    <span>{user.email}</span>
                  </span>
                )}
                {collectedRoles.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="opacity-60">نقش‌ها:</span>
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {collectedRoles.map((r) => {
                        const active = r === activeRoleFilter;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              setActiveRoleFilter(active ? null : r)
                            }
                            className={cn(
                              "rounded-md border px-1.5 py-0.5 text-[10px] transition",
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background/40 text-muted-foreground border-border/60 hover:bg-muted/50"
                            )}>
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </span>
                )}
              </PanelDescription>
            </div>
          </div>
        </PanelHeader>
        <PanelContent className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
            <StatItem
              icon={Building2}
              label="تعداد سازمان‌ها"
              value={totalOrgs}
              loading={orgsQuery.isLoading}
            />
            <StatItem
              icon={Layers}
              label="نقش‌های متمایز"
              value={collectedRoles.length}
              loading={orgsQuery.isLoading}
            />
            <StatItem
              icon={Users2}
              label="کل آزمون‌ها"
              value={totalTests}
              loading={false}
            />
            <StatItem
              icon={Crown}
              label="آزمون‌های مشارکت شده"
              value={`${participatedTests} (${completionRate}%)`}
              loading={false}
            />
          </div>
        </PanelContent>
      </Panel>
      {/* Tests List Panel */}
      <Panel>
        <PanelHeader>
          <PanelTitle className="text-sm">آزمون‌ها</PanelTitle>
          <PanelDescription>
            لیست آزمون‌های کاربر (نمونه داده موقت)
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="flex flex-col gap-4 text-[12px] leading-5">
          {/* Placeholder test list */}
          <div className="grid gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-border/50 bg-background/40 px-3 py-2 hover:bg-muted/40 transition">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-[12px]">
                    آزمون شماره {i}
                  </span>
                  <span className="ms-auto inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                    وضعیت: در حال توسعه
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span>تعداد سوال: 20</span>
                  <span>مدت: 30 دقیقه</span>
                  <span>امتیاز من: —</span>
                  <span className="ltr:font-mono opacity-70">
                    ID: TST-{1000 + i}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-8 text-[11px]">
              نمایش بیشتر
            </Button>
            <Button size="sm" className="h-8 text-[11px]">
              ایجاد آزمون جدید
            </Button>
          </div>
        </PanelContent>
      </Panel>
    </div>
  );
}
