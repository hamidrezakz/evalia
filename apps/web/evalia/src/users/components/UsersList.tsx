"use client";
import * as React from "react";
import { useUsers } from "../api/users-hooks";
import { UsersTable } from "./UsersTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import UserUpsertDialog from "./UserUpsertDialog";
import { Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Combobox from "@/components/ui/combobox";
import { UserStatusEnum } from "@/lib/enums";
import { useOrganizations } from "@/organizations/organization/context/queries";
import { Label } from "@/components/ui/label";

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
  const [createOpen, setCreateOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [orgFilter, setOrgFilter] = React.useState<number | null>(null);

  const orgsQuery = useOrganizations(true);
  const orgItems = React.useMemo(
    () => (orgsQuery.data || []).map((o) => ({ id: o.id, name: o.name })),
    [orgsQuery.data]
  );

  const { data, isLoading, isError, error, refetch } = useUsers({
    q,
    status: (statusFilter as any) || undefined,
    orgId: orgFilter || undefined,
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row gap-2 lg:items-end">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو کاربر…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            {/* Filters */}
            <div className="flex flex-row flex-wrap gap-2">
              <div className="min-w-40">
                <Label className="mb-1 hidden sm:block">وضعیت</Label>
                <Select
                  value={statusFilter || ""}
                  onValueChange={(v) =>
                    setStatusFilter(v === "__all__" || v === "" ? null : v)
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="همه وضعیت‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">همه</SelectItem>
                    {UserStatusEnum.options().map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-56">
                <Label className="mb-1 hidden sm:block">سازمان</Label>
                <Combobox
                  items={[{ id: 0, name: "همه سازمان‌ها" }, ...orgItems]}
                  value={orgFilter ?? 0}
                  onChange={(val) => {
                    const n = Number(val);
                    setOrgFilter(n && Number.isFinite(n) ? n : null);
                  }}
                  placeholder="فیلتر سازمان"
                  getKey={(it) => (it as any).id}
                  getLabel={(it) => (it as any).name}
                />
              </div>
            </div>
            {/* Add button */}
            <div className="lg:ms-auto">
              <UserUpsertDialog
                mode="create"
                restrictToActiveOrg={false}
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={() => {
                  setCreateOpen(false);
                  refetch();
                }}
                trigger={<Button icon={<Plus />}>افزودن کاربر</Button>}
              />
            </div>
          </div>
        </div>
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
      )}

      {/* Edit dialog mounted once; opens when a row is clicked */}
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
