"use client";
import * as React from "react";
import {
  useOrganizations,
  useUpdateOrganization,
  useChangeOrganizationStatusAction,
  useRestoreOrganizationAction,
} from "../api/organization-hooks";
import { OrganizationsTable } from "./OrganizationsTable";
import { Panel } from "@/components/ui/panel";
import AddOrganizationDialog from "./add-organization-dialog";
import { useDeleteOrganizationAction } from "../api/organization-hooks";
import EditOrganizationNameDialog from "./edit-organization-name-dialog";
import { OrganizationsListHeader } from "./OrganizationsListHeader";
import { useOrganizationChildren } from "../api/organization-hooks";
import { useOrgState } from "../context/org-context";

export interface OrganizationsListProps {
  initialQuery?: Partial<{ q: string; page: number; pageSize: number }>;
  canEdit?: (orgId: number) => boolean;
  canDelete?: (orgId: number) => boolean;
  canActivate?: (orgId: number) => boolean;
  canSuspend?: (orgId: number) => boolean;
  canRestore?: (orgId: number) => boolean;
  /**
   * Parent selection mode:
   * - 'selectable' (default): user can choose a parent via combobox (parentsOnly)
   * - 'active-only': use activeOrganizationId from OrgContext as parent, hide parent selector, and do not fetch parents list
   */
  parentSelectionMode?: "selectable" | "active-only";
}

export function OrganizationsList({
  initialQuery,
  canEdit,
  canDelete,
  canActivate,
  canSuspend,
  canRestore,
  parentSelectionMode = "selectable",
}: OrganizationsListProps) {
  const orgCtx = useOrgState();
  const [q, setQ] = React.useState(initialQuery?.q || "");
  const [status, setStatus] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  // Parent org selection (null => show all orgs)
  const [parentOrgId, setParentOrgId] = React.useState<number | null>(null);

  // Effective parent id based on mode
  const effectiveParentOrgId: number | null =
    parentSelectionMode === "active-only"
      ? orgCtx.activeOrganizationId ?? null
      : parentOrgId;

  // When a parent organization is chosen, fetch its children via relationships API
  const childrenQ = useOrganizationChildren(
    effectiveParentOrgId,
    !!effectiveParentOrgId,
    {
      q,
      status: status || undefined,
    } as any
  );
  const listQ = useOrganizations(
    {
      q,
      status: status || undefined,
      page: 1,
      pageSize: 20,
    },
    { enabled: !effectiveParentOrgId }
  );
  const isLoading = effectiveParentOrgId
    ? childrenQ.isLoading
    : listQ.isLoading;
  const isError = effectiveParentOrgId ? !!childrenQ.error : !!listQ.error;
  const rows: any[] = React.useMemo(() => {
    if (effectiveParentOrgId) {
      const rels = childrenQ.data || [];
      return rels.map((r: any) => r.child).filter(Boolean);
    } else {
      return listQ.data?.data || [];
    }
  }, [effectiveParentOrgId, childrenQ.data, listQ.data]);

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
          parentOrganizationId={
            parentSelectionMode === "selectable" ? parentOrgId : undefined
          }
          onParentChange={
            parentSelectionMode === "selectable" ? setParentOrgId : undefined
          }
          hideParentSelector={parentSelectionMode === "active-only"}
        />
      </Panel>

      {parentSelectionMode === "active-only" && !effectiveParentOrgId ? (
        <Panel className="p-8 text-sm text-muted-foreground" dir="rtl">
          ابتدا یک سازمان فعال انتخاب کنید تا زیرسازمان‌ها نمایش داده شود.
        </Panel>
      ) : null}

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
          rows={rows as any}
          rowActions={(o) => {
            const status = o.status as string;
            return {
              organizationSlug: o.slug,
              organizationName: o.name,
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
