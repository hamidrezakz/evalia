"use client";
import { Suspense } from "react";
import { useAuthContext } from "@/app/auth/context/AuthContext";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelContent,
  PanelFooter,
} from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

function AuthContextDebugPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    accessToken,
    refreshToken,
    decoded,
    userId,
    user,
    organizations,
    active,
    platformRoles,
    organizationRoles,
    loading,
    error,
    refetchAll,
    signOut,
    isTokenExpired,
  } = useAuthContext();

  const short = (t: string | null) =>
    t ? t.substring(0, 24) + (t.length > 24 ? "…" : "") : "—";

  // During SSR/hydration, show placeholders to avoid hydration mismatch
  if (!mounted) {
    return (
      <Panel>
        <PanelHeader>
          <PanelTitle>Auth Context Snapshot</PanelTitle>
        </PanelHeader>
        <PanelContent className="flex flex-col gap-4 text-xs md:text-sm">
          <section>
            <h4 className="font-semibold mb-1">Tokens</h4>
            <div className="grid gap-1">
              <div>
                Access: <span className="text-muted-foreground">—</span>
              </div>
              <div>
                Refresh: <span className="text-muted-foreground">—</span>
              </div>
              <div>
                Expired: <span className="text-muted-foreground">—</span>
              </div>
            </div>
          </section>
          <section>
            <h4 className="font-semibold mb-1">User</h4>
            <div className="grid gap-1">
              <div>UserId: —</div>
              <div>FullName: —</div>
            </div>
          </section>
          <section>
            <h4 className="font-semibold mb-1">Active Selection</h4>
            <div className="grid gap-1">
              <div>OrganizationId: —</div>
              <div>Platform Role: —</div>
              <div>Org Role: —</div>
            </div>
          </section>
          <section>
            <h4 className="font-semibold mb-1">Organizations (—)</h4>
            <ul className="list-disc pr-4 space-y-1">
              <li className="list-none text-muted-foreground">—</li>
            </ul>
          </section>
          <section>
            <h4 className="font-semibold mb-1">Platform Roles</h4>
            <span className="text-muted-foreground">—</span>
          </section>
          <section>
            <h4 className="font-semibold mb-1">Organization Roles Map</h4>
            <div className="text-muted-foreground">—</div>
          </section>
          <section>
            <h4 className="font-semibold mb-1">Decoded (raw)</h4>
            <pre className="whitespace-pre-wrap break-all bg-muted/40 p-2 rounded text-[10px] md:text-[11px] max-h-48 overflow-auto">
              —
            </pre>
          </section>
        </PanelContent>
        <PanelFooter className="justify-between">
          <div className="flex gap-2">
            <Button size="sm" disabled>
              Refetch All
            </Button>
            <Button size="sm" variant="secondary" disabled>
              Sign Out
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">Loading…</span>
        </PanelFooter>
      </Panel>
    );
  }

  // Client-only: render real data
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Auth Context Snapshot</PanelTitle>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-4 text-xs md:text-sm">
        {/* ...existing code... */}
        <section>
          <h4 className="font-semibold mb-1">Tokens</h4>
          <div className="grid gap-1">
            <div>
              Access:{" "}
              <code dir="ltr" className="break-all">
                {short(accessToken)}
              </code>
            </div>
            <div>
              Refresh:{" "}
              <code dir="ltr" className="break-all">
                {short(refreshToken)}
              </code>
            </div>
            <div>Expired: {isTokenExpired() ? "Yes" : "No"}</div>
          </div>
        </section>
        <section>
          <h4 className="font-semibold mb-1">User</h4>
          <div className="grid gap-1">
            <div>UserId: {userId ?? "—"}</div>
            <div>
              FullName:{" "}
              {user?.fullName ||
                `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                "—"}
            </div>
          </div>
        </section>
        <section>
          <h4 className="font-semibold mb-1">Active Selection</h4>
          <div className="grid gap-1">
            <div>OrganizationId: {active.organizationId ?? "—"}</div>
            <div>Platform Role: {active.platformRole ?? "—"}</div>
            <div>Org Role: {active.orgRole ?? "—"}</div>
          </div>
        </section>
        <section>
          <h4 className="font-semibold mb-1">
            Organizations ({organizations.length})
          </h4>
          <ul className="list-disc pr-4 space-y-1">
            {organizations.map((o: any) => (
              <li key={o.id} className="break-all">
                {o.id} - {o.name}
              </li>
            ))}
            {organizations.length === 0 && (
              <li className="list-none text-muted-foreground">—</li>
            )}
          </ul>
        </section>
        <section>
          <h4 className="font-semibold mb-1">Platform Roles</h4>
          <div className="flex flex-wrap gap-2">
            {platformRoles.length ? (
              platformRoles.map((r) => (
                <span
                  key={r}
                  className="rounded bg-muted px-2 py-0.5 text-[11px]">
                  {r}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        </section>
        <section>
          <h4 className="font-semibold mb-1">Organization Roles Map</h4>
          <div className="space-y-1">
            {Object.keys(organizationRoles).length ? (
              Object.entries(organizationRoles).map(([orgId, roles]) => (
                <div key={orgId} className="flex items-start gap-2">
                  <span className="text-muted-foreground">{orgId}:</span>
                  <span>{(roles || []).join(", ") || "—"}</span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">—</div>
            )}
          </div>
        </section>
        <section>
          <h4 className="font-semibold mb-1">Decoded (raw)</h4>
          <pre className="whitespace-pre-wrap break-all bg-muted/40 p-2 rounded text-[10px] md:text-[11px] max-h-48 overflow-auto">
            {decoded ? JSON.stringify(decoded, null, 2) : "—"}
          </pre>
        </section>
        {error && (
          <section>
            <h4 className="font-semibold mb-1 text-red-600 dark:text-red-400">
              Error
            </h4>
            <div className="text-red-600 dark:text-red-400 break-all text-xs whitespace-pre-wrap">
              {typeof error === "string"
                ? error
                : (error as any)?.message || "Unknown error"}
              {error && typeof error === "object" && (
                <>
                  {(error as any).status &&
                    `\nStatus: ${(error as any).status}`}
                  {(error as any).error && `\nError: ${(error as any).error}`}
                </>
              )}
            </div>
          </section>
        )}
      </PanelContent>
      <PanelFooter className="justify-between">
        <div className="flex gap-2">
          <Button size="sm" disabled={loading} onClick={() => refetchAll()}>
            Refetch All
          </Button>
          <Button size="sm" variant="secondary" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
        <span className="text-xs text-muted-foreground">
          {loading ? "Loading…" : "Idle"}
        </span>
      </PanelFooter>
    </Panel>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-muted-foreground">Loading…</div>
      }>
      <div className="p-2 md:p-4 lg:p-6 max-w-6xl mx-auto">
        <AuthContextDebugPanel />
      </div>
    </Suspense>
  );
}
