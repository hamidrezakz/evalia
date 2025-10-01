"use client";
import * as React from "react";
import { useUsers } from "../api/users-hooks";
import { UsersTable } from "./UsersTable";
import { Panel } from "@/components/ui/panel";
import UserUpsertDialog from "./UserUpsertDialog";
import { useOrganizations } from "@/organizations/organization/api/organization-hooks";
import { UsersListHeader } from "./UsersListHeader";

export interface UsersListProps {
  orgId?: number; // reserve for org scoping if needed
  initialQuery?: Partial<{ q: string; page: number; pageSize: number }>;
  canEdit?: (userId: number) => boolean;
  canBlock?: (userId: number) => boolean;
  canDelete?: (userId: number) => boolean;
}

export function UsersList({
  initialQuery,
  canEdit,
  canBlock,
  canDelete,
}: UsersListProps) {
  const [q, setQ] = React.useState(initialQuery?.q || "");
  const [editId, setEditId] = React.useState<number | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [orgFilter, setOrgFilter] = React.useState<number | null>(null);
  const [roleFilter, setRoleFilter] = React.useState<string[]>([]);

  const orgsQuery = useOrganizations({ page: 1, pageSize: 30 });
  const orgItems = React.useMemo(() => {
    try {
      const src = orgsQuery.data as any;
      if (!src) return [];
      if (Array.isArray(src))
        return src.map((o) => ({ id: o.id, name: o.name }));
      if (Array.isArray(src.data))
        return src.data.map((o: any) => ({ id: o.id, name: o.name }));
      if (src.data && Array.isArray(src.data.data))
        return src.data.data.map((o: any) => ({ id: o.id, name: o.name }));
      if (src.data && Array.isArray(src.data.items))
        return src.data.items.map((o: any) => ({ id: o.id, name: o.name }));
      return [];
    } catch {
      return [];
    }
  }, [orgsQuery.data]);

  const { data, isLoading, isError, error, refetch } = useUsers({
    q,
    status: (statusFilter as any) || undefined,
    orgId: orgFilter || undefined,
    platformRoles: roleFilter.length ? roleFilter : undefined,
    page: 1,
    pageSize: 20,
  });
  const rows = data?.data || [];

  let errorMessage = "خطا در دریافت لیست کاربران";
  if (isError && error) {
    if (typeof error === "string") errorMessage = error;
    else if (error instanceof Error) errorMessage = error.message;
    else if (
      error &&
      typeof error === "object" &&
      error !== null &&
      "message" in error
    )
      errorMessage = (error as { message?: string }).message || errorMessage;
  }

  return (
    <div className="w-full space-y-4">
      <Panel className="p-4">
        <UsersListHeader
          q={q}
          onSearch={setQ}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          orgFilter={orgFilter}
          onOrgChange={(v) => setOrgFilter(v)}
          roleFilter={roleFilter}
          onRoleToggle={(role) =>
            setRoleFilter((prev) =>
              prev.includes(role)
                ? prev.filter((r) => r !== role)
                : [...prev, role]
            )
          }
          onRoleReset={() => setRoleFilter([])}
          orgItems={orgItems}
          orgsLoading={orgsQuery.isLoading}
          orgsError={!!orgsQuery.error}
          onOrgRefetch={() => orgsQuery.refetch()}
          onCreateSuccess={() => refetch()}
        />
      </Panel>

      {isLoading ? (
        <Panel className="p-8 text-sm text-muted-foreground">
          در حال دریافت لیست…
        </Panel>
      ) : isError ? (
        <Panel className="p-8 text-sm text-rose-600">{errorMessage}</Panel>
      ) : rows.length === 0 ? (
        <Panel className="p-8 text-sm text-muted-foreground">
          کاربری یافت نشد
        </Panel>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <UsersTable
            rows={rows}
            onRowClick={(u) => setEditId(u.id)}
            rowActions={(u) => ({
              canEdit: canEdit?.(u.id),
              canBlock: canBlock?.(u.id),
              canDelete: canDelete?.(u.id),
              onEdit: () => setEditId(u.id),
              onBlock: () => console.log("block", u.id),
              onDelete: () => {},
              userId: u.id,
            })}
          />
        </div>
      )}

      <UserUpsertDialog
        mode="edit"
        open={editId != null}
        onOpenChange={(v) => !v && setEditId(null)}
        defaultValues={
          editId != null
            ? {
                id: editId,
                fullName: rows.find((r) => r.id === editId)?.fullName || "",
                phone: rows.find((r) => r.id === editId)?.phone || "",
                status: rows.find((r) => r.id === editId)?.status || "ACTIVE",
              }
            : undefined
        }
        onSuccess={() => {
          setEditId(null);
          refetch();
        }}
      />
    </div>
  );
}
