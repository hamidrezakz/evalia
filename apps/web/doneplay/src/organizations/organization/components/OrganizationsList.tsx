"use client";
import * as React from "react";
import {
  useOrganizations,
  useUpdateOrganization,
  useChangeOrganizationStatusAction,
  useRestoreOrganizationAction,
} from "../api/organization-hooks";
import { OrganizationsTable } from "./OrganizationsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Plus, Search, Filter } from "lucide-react";
import AddOrganizationDialog from "./add-organization-dialog";
import { useDeleteOrganizationAction } from "../api/organization-hooks";
import EditOrganizationNameDialog from "./edit-organization-name-dialog";
import { OrganizationsListHeader } from "./OrganizationsListHeader";

export interface OrganizationsListProps {
  initialQuery?: Partial<{ q: string; page: number; pageSize: number }>;
  canEdit?: (orgId: number) => boolean;
  canDelete?: (orgId: number) => boolean;
  canActivate?: (orgId: number) => boolean;
  canSuspend?: (orgId: number) => boolean;
  canRestore?: (orgId: number) => boolean;
}

export function OrganizationsList({
  initialQuery,
  canEdit,
  canDelete,
  canActivate,
  canSuspend,
  canRestore,
}: OrganizationsListProps) {
  const [q, setQ] = React.useState(initialQuery?.q || "");
  const [status, setStatus] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useOrganizations({
    q,
    status: status || undefined,
    page: 1,
    pageSize: 20,
  });
  const rows = data?.data || [];

  // Mutations for actions
  const del = useDeleteOrganizationAction();
  const changeStatus = useChangeOrganizationStatusAction();
  const restore = useRestoreOrganizationAction();

  return (
    <div className="w-full space-y-4">
      <Panel className="p-4" dir="rtl">
        <OrganizationsListHeader
          q={q}
          onSearch={setQ}
          status={status}
          onStatusChange={setStatus}
          onAddClick={() => setCreateOpen(true)}
        />
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
          rowActions={(o) => {
            const status = o.status as string;
            return {
              canEdit: canEdit?.(o.id),
              canDelete: canDelete?.(o.id),
              canActivate:
                (status === "INACTIVE" || status === "SUSPENDED") &&
                !!canActivate?.(o.id),
              canSuspend: status === "ACTIVE" && !!canSuspend?.(o.id),
              canRestore:
                status === "DELETED" || status === "SUSPENDED"
                  ? !!canRestore?.(o.id)
                  : false,
              onEdit: () => setEditId(o.id),
              onDelete: () => del.mutate(o.id),
              onActivate: () =>
                changeStatus.mutate({ id: o.id, status: "ACTIVE" as any }),
              onSuspend: () =>
                changeStatus.mutate({ id: o.id, status: "SUSPENDED" as any }),
              onRestore: () => restore.mutate(o.id),
            };
          }}
        />
      )}
      <AddOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditOrganizationNameDialog
        orgId={editId}
        open={!!editId}
        onOpenChange={(open: boolean) => !open && setEditId(null)}
      />
    </div>
  );
}
