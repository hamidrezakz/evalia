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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { OrganizationStatusEnum } from "@/lib/enums";
import AddOrganizationDialog from "./add-organization-dialog";
import { useDeleteOrganizationAction } from "../api/organization-hooks";
import EditOrganizationNameDialog from "./edit-organization-name-dialog";

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
        <div className="flex flex-col gap-3 lg:gap-2">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو سازمان…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[9rem] justify-between"
                  size="sm">
                  <span className="flex items-center gap-1">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    {status
                      ? OrganizationStatusEnum.t(status as any)
                      : "همه وضعیت‌ها"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs">
                  فیلتر وضعیت
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setStatus(null)}
                  className="text-xs cursor-pointer">
                  همه
                </DropdownMenuItem>
                {OrganizationStatusEnum.options().map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className="text-xs cursor-pointer">
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1" />
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="gap-1">
              <Plus className="h-4 w-4" /> افزودن سازمان
            </Button>
          </div>
          {status && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              <span>
                فیلتر فعال: وضعیت = {OrganizationStatusEnum.t(status as any)}
              </span>
              <button
                onClick={() => setStatus(null)}
                className="px-2 py-0.5 rounded border border-muted-foreground/30 hover:bg-muted text-[10px]">
                حذف فیلتر
              </button>
            </div>
          )}
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
