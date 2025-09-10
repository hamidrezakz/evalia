"use client";
import * as React from "react";
import { useOrganizations } from "../api/organization-hooks";
import { OrganizationsTable } from "./OrganizationsTable";
import { OrganizationDetailSheet } from "./OrganizationDetailSheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  useChangeOrganizationStatusAction,
  useDeleteOrganizationAction,
  useRestoreOrganizationAction,
} from "../api/organization-hooks";

export interface OrganizationsListProps {
  initialQuery?: Partial<{ q: string; page: number; pageSize: number }>;
  canEdit?: (orgId: number) => boolean;
  canSuspend?: (orgId: number) => boolean;
  canActivate?: (orgId: number) => boolean;
  canDelete?: (orgId: number) => boolean;
  canRestore?: (orgId: number) => boolean;
}

export function OrganizationsList({
  initialQuery,
  canEdit,
  canSuspend,
  canActivate,
  canDelete,
  canRestore,
}: OrganizationsListProps) {
  const [q, setQ] = React.useState(initialQuery?.q || "");
  const [sheetId, setSheetId] = React.useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useOrganizations({
    q,
    page: 1,
    pageSize: 20,
  });

  const rows = data || [];

  // Mutations for actions
  const changeStatus = useChangeOrganizationStatusAction();
  const del = useDeleteOrganizationAction();
  const restore = useRestoreOrganizationAction();

  return (
    <div className="w-full space-y-4">
      <Panel className="p-4">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input
            placeholder="جستجو سازمان…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-md"
          />
          <div className="flex-1" />
          <Button onClick={() => refetch()}>جستجو</Button>
        </div>
      </Panel>

      {isLoading ? (
        <Panel className="p-8 text-sm text-muted-foreground">
          در حال دریافت لیست…
        </Panel>
      ) : isError ? (
        <Panel className="p-8 text-sm text-rose-600">
          خطا در دریافت لیست سازمان‌ها
        </Panel>
      ) : rows.length === 0 ? (
        <Panel className="p-8 text-sm text-muted-foreground">
          سازمانی یافت نشد
        </Panel>
      ) : (
        <OrganizationsTable
          rows={rows}
          onRowClick={(o) => setSheetId(o.id)}
          rowActions={(o) => ({
            canEdit: canEdit?.(o.id),
            canSuspend: canSuspend?.(o.id) && o.status !== "SUSPENDED",
            canActivate: canActivate?.(o.id) && o.status !== "ACTIVE",
            canDelete: canDelete?.(o.id),
            canRestore: canRestore?.(o.id) && !!o.deletedAt,
            onEdit: () => setSheetId(o.id),
            onSuspend: () =>
              changeStatus.mutate({ status: "SUSPENDED", id: o.id }),
            onActivate: () =>
              changeStatus.mutate({ status: "ACTIVE", id: o.id }),
            onDelete: () => del.mutate(o.id),
            onRestore: () => restore.mutate(o.id),
          })}
        />
      )}

      <OrganizationDetailSheet
        organizationId={sheetId}
        open={!!sheetId}
        onOpenChange={(o) => !o && setSheetId(null)}
      />
    </div>
  );
}
