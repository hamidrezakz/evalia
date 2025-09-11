"use client";
import React from "react";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelFooter,
} from "@/components/ui/panel";
import { useAuthSession } from "@/app/auth/event-context";
import { useOrgState } from "@/app/organizations/organization/context";
import { useUserDataContext } from "@/app/users/context";
import { useNavigationContext } from "@/app/navigation/context";

// Helper
const short = (t: string | null | undefined) =>
  t ? t.substring(0, 28) + (t.length > 28 ? "…" : "") : "—";

function PanelSkeleton({ title }: { title: string }) {
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>{title}</PanelTitle>
      </PanelHeader>
      <PanelContent className="text-xs text-muted-foreground">
        در حال بارگذاری…
      </PanelContent>
    </Panel>
  );
}

/* 1) پنل نشست / توکن */
function SessionPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const {
    accessToken,
    refreshToken,
    decoded,
    userId,
    isTokenExpired,
    attemptRefresh,
    signOut,
    loading,
  } = useAuthSession();
  if (!mounted) return <PanelSkeleton title="نشست احراز هویت" />;
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>نشست احراز هویت</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-5 text-[11px] md:text-xs">
        <section className="space-y-2">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant={isTokenExpired() ? "destructive" : "secondary"}>
              {isTokenExpired() ? "Token Expiring Soon" : "Token OK"}
            </Badge>
            {userId && <Badge variant="outline">User #{userId}</Badge>}
            {typeof decoded?.iat === "string" ||
            typeof decoded?.iat === "number" ? (
              <Badge variant="outline">iat: {String(decoded.iat)}</Badge>
            ) : null}
            {typeof decoded?.exp === "string" ||
            typeof decoded?.exp === "number" ? (
              <Badge variant="outline">exp: {String(decoded.exp)}</Badge>
            ) : null}
          </div>
          <div className="grid gap-1">
            <div className="font-semibold text-[12px]">توکن‌ها</div>
            <div className="grid gap-1 rounded-md border bg-background/40 p-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Access</span>
                <code dir="ltr" className="font-mono">
                  {short(accessToken)}
                </code>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Refresh</span>
                <code dir="ltr" className="font-mono">
                  {short(refreshToken)}
                </code>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Expiring</span>
                <span>{isTokenExpired() ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-[12px]">Payload</div>
            <pre className="bg-muted/50 backdrop-blur-sm border rounded-md p-2 max-h-48 overflow-auto text-[10px] leading-relaxed whitespace-pre-wrap break-all">
              {decoded ? JSON.stringify(decoded, null, 2) : "—"}
            </pre>
          </div>
        </section>
      </PanelContent>
      <PanelFooter className="justify-between">
        <div className="flex gap-2">
          <Button size="sm" disabled={loading} onClick={() => attemptRefresh()}>
            رفرش دستی
          </Button>
          <Button size="sm" variant="secondary" onClick={() => signOut()}>
            خروج
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          {loading ? "لودینگ" : "آماده"}
        </span>
      </PanelFooter>
    </Panel>
  );
}

/* 2) پنل سازمان و نقش فعال */
function OrgPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const {
    organizations,
    organizationRoles,
    platformRoles,
    activeOrganizationId,
    activeRole,
    activeRoleSource,
    setActiveOrganization,
    setPlatformActiveRole,
    setOrganizationActiveRole,
    refreshOrganizations,
    loading,
  } = useOrgState();
  if (!mounted) return <PanelSkeleton title="سازمان و نقش" />;
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>سازمان و نقش فعال</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-6 text-[11px] md:text-xs">
        <section className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            {activeRole && (
              <Badge variant="default">Active: {activeRole}</Badge>
            )}
            {activeRoleSource && (
              <Badge variant="secondary">Source: {activeRoleSource}</Badge>
            )}
            {typeof activeOrganizationId === "number" && (
              <Badge variant="outline">Org #{activeOrganizationId}</Badge>
            )}
          </div>
          <div className="grid gap-1 rounded-md border bg-background/40 p-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organization</span>
              <span>{activeOrganizationId ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span>{activeRole ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span>{activeRoleSource ?? "—"}</span>
            </div>
          </div>
        </section>
        <Separator />
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              Organizations ({organizations.length})
            </h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refreshOrganizations()}
              disabled={loading}>
              Refresh
            </Button>
          </div>
          <ul className="flex flex-col gap-2">
            {organizations.map((o) => (
              <li
                key={o.id}
                className="rounded-md border bg-background/40 p-2 flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-medium">{o.name}</span>
                  <Badge variant="outline">ID {o.id}</Badge>
                  <Button
                    size="sm"
                    variant={
                      activeOrganizationId === o.id ? "default" : "secondary"
                    }
                    onClick={() => setActiveOrganization(o.id)}>
                    Select
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(organizationRoles[o.id] || []).map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant={
                        activeRole === r && activeRoleSource === "organization"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setOrganizationActiveRole(r, o.id)}>
                      {r}
                    </Button>
                  ))}
                  {!(organizationRoles[o.id] || []).length && (
                    <span className="text-muted-foreground">No roles</span>
                  )}
                </div>
              </li>
            ))}
            {!organizations.length && (
              <li className="text-muted-foreground text-center p-2 border rounded-md">
                No organizations
              </li>
            )}
          </ul>
        </section>
        <Separator />
        <section className="space-y-2">
          <h4 className="font-semibold">Platform Roles</h4>
          <div className="flex flex-wrap gap-2">
            {platformRoles.length ? (
              platformRoles.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={
                    activeRole === r && activeRoleSource === "platform"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setPlatformActiveRole(r)}>
                  {r}
                </Button>
              ))
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        </section>
      </PanelContent>
      <PanelFooter className="justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            disabled={loading}
            onClick={() => refreshOrganizations()}>
            رفرش سازمان‌ها
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPlatformActiveRole(null);
              setOrganizationActiveRole(null);
            }}>
            خالی کردن نقش
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          {loading ? "لودینگ" : "آماده"}
        </span>
      </PanelFooter>
    </Panel>
  );
}

/* 3) پنل اطلاعات کاربر */
function UserPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { user, userId, loading, error, refetch } = useUserDataContext();
  if (!mounted) return <PanelSkeleton title="کاربر" />;
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>اطلاعات کاربر</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-5 text-[11px] md:text-xs">
        <div className="flex flex-wrap gap-2">
          {userId && <Badge variant="outline">User #{userId}</Badge>}
          {user?.email && <Badge variant="secondary">{user.email}</Badge>}
        </div>
        <div className="grid gap-1 rounded-md border bg-background/40 p-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Full name</span>
            <span>
              {user?.fullName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{user?.createdAt || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated</span>
            <span>
              {user && "updatedAt" in user
                ? (user as { updatedAt?: string }).updatedAt ?? "—"
                : "—"}
            </span>
          </div>
        </div>
        {error && (
          <div className="text-red-600 dark:text-red-400 break-all">
            Error: {error}
          </div>
        )}
      </PanelContent>
      <PanelFooter className="justify-between">
        <Button size="sm" disabled={loading} onClick={() => refetch()}>
          دریافت مجدد
        </Button>
        <span className="text-xs text-muted-foreground">
          {loading ? "لودینگ" : "آماده"}
        </span>
      </PanelFooter>
    </Panel>
  );
}

// نمایش درخت کامل ناوبری به صورت بازگشتی
const TreeList = ({ nodes }: { nodes: unknown[] }): React.ReactElement =>
  !nodes?.length ? (
    <div className="text-muted-foreground">No items</div>
  ) : (
    <ul className="flex flex-col gap-1">
      {nodes.map((node) => {
        const n = node as Record<string, unknown>;
        return (
          <li
            key={String(n.id)}
            className="rounded border bg-background/40 px-2 py-1">
            <div className="flex justify-between gap-2">
              <span className="truncate" title={String(n.label)}>
                {String(n.label)}
              </span>
              {typeof n.path === "string" || typeof n.path === "number" ? (
                <code dir="ltr" className="text-[10px] opacity-70">
                  {String(n.path)}
                </code>
              ) : null}
            </div>
            {Array.isArray(n.children) && n.children.length > 0 && (
              <div className="pl-4 border-l mt-2">
                <TreeList nodes={n.children} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

/* 4) پنل ناوبری */
function NavigationPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const {
    items,
    flatten,
    hasPath,
    findByPath,
    activeRole,
    activeRoleSource,
    loading,
    error,
    refetch,
  } = useNavigationContext();
  const flat = flatten();
  if (!mounted) return <PanelSkeleton title="ناوبری" />;
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>ناوبری (درخت / فلت)</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-6 text-[11px] md:text-xs">
        <section className="grid gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            {activeRole && <Badge variant="default">Role: {activeRole}</Badge>}
            {activeRoleSource && (
              <Badge variant="secondary">Source: {activeRoleSource}</Badge>
            )}
            <Badge variant="outline">Tree {items.length}</Badge>
            <Badge variant="outline">Flat {flat.length}</Badge>
          </div>
          <div className="grid gap-1 rounded-md border bg-background/40 p-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active role</span>
              <span>{activeRole ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span>{activeRoleSource ?? "—"}</span>
            </div>
          </div>
        </section>
        <Separator />
        <section className="space-y-2">
          <h4 className="font-semibold">درخت کامل ناوبری</h4>
          <TreeList nodes={items} />
        </section>
        <Separator />
        <section className="space-y-2">
          <h4 className="font-semibold">لیست فلت ناوبری</h4>
          <ul className="flex flex-col gap-1">
            {flat.map((it) => {
              const f = it as Record<string, unknown>;
              return (
                <li
                  key={String(f.id)}
                  className="rounded border bg-background/40 px-2 py-1 flex justify-between gap-2">
                  <span className="truncate" title={String(f.label)}>
                    {String(f.label)}
                  </span>
                  {typeof f.path === "string" || typeof f.path === "number" ? (
                    <code dir="ltr" className="text-[10px] opacity-70">
                      {String(f.path)}
                    </code>
                  ) : null}
                </li>
              );
            })}
            {!flat.length && (
              <li className="text-muted-foreground text-center p-2 border rounded-md">
                No items
              </li>
            )}
          </ul>
        </section>
        {/* ...existing code... */}
        <Separator />
        <section className="space-y-2">
          <h4 className="font-semibold">Test helpers</h4>
          <div className="flex gap-2 flex-wrap items-center">
            <Button size="sm" onClick={() => refetch()}>
              Refetch
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                alert(
                  hasPath("/dashboard")
                    ? "dashboard exists"
                    : "dashboard missing"
                )
              }>
              {`hasPath('/dashboard')`}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const f = findByPath("/dashboard");
                alert(f ? `found: ${f.label}` : "not found");
              }}>
              {`findByPath('/dashboard')`}
            </Button>
          </div>
        </section>
        {error && (
          <div className="text-red-600 dark:text-red-400 break-all">
            Error: {error}
          </div>
        )}
      </PanelContent>
      <PanelFooter className="justify-end">
        <span className="text-xs text-muted-foreground">
          {loading ? "لودینگ" : "آماده"}
        </span>
      </PanelFooter>
    </Panel>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full items-centerp-4 text-sm text-muted-foreground">
          در حال بارگذاری…
        </div>
      }>
      <div className="flex w-full items-center justify-center space-y-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          <SessionPanel />
          <OrgPanel />
          <UserPanel />
          <NavigationPanel />
        </div>
      </div>
    </Suspense>
  );
}
