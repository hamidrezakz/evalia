"use client";
import * as React from "react";
import { useUsers } from "../api/users-hooks";
import { UsersTable } from "./UsersTable";
import { UserDetailSheet } from "./UserDetailSheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

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
  const [sheetId, setSheetId] = React.useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    q,
    page: 1,
    pageSize: 20,
  });

  const rows = data?.data || [];

  return (
    <div className="w-full space-y-4">
      <Panel className="p-4">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input
            placeholder="جستجو کاربر…"
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
          خطا در دریافت لیست کاربران
        </Panel>
      ) : rows.length === 0 ? (
        <Panel className="p-8 text-sm text-muted-foreground">
          کاربری یافت نشد
        </Panel>
      ) : (
        <UsersTable
          rows={rows}
          onRowClick={(u) => setSheetId(u.id)}
          rowActions={(u) => ({
            canEdit: canEdit?.(u.id),
            canBlock: canBlock?.(u.id),
            canDelete: canDelete?.(u.id),
            onEdit: () => setSheetId(u.id),
            onBlock: () => console.log("block", u.id),
            onDelete: () => console.log("delete", u.id),
          })}
        />
      )}

      <UserDetailSheet
        userId={sheetId}
        open={!!sheetId}
        onOpenChange={(o) => !o && setSheetId(null)}
      />
    </div>
  );
}
