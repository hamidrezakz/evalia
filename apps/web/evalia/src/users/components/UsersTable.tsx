import * as React from "react";
import { UserListItem } from "../types/users.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserStatusBadge } from "./UserStatusBadge";
import { UsersRowActions, UsersRowActionsProps } from "./UsersRowActions";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface UsersTableProps {
  rows: UserListItem[];
  className?: string;
  rowActions?: (user: UserListItem) => UsersRowActionsProps | null;
  onRowClick?: (user: UserListItem) => void;
}

export function UsersTable({
  rows,
  className,
  rowActions,
  onRowClick,
}: UsersTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <Table className="border-separate border-spacing-y-2">
        {/* Head: پنهان در موبایل برای ریسپانسیو بهتر */}
        <TableHeader className="hidden md:table-header-group">
          <TableRow className="text-sm text-muted-foreground">
            <TableHead className="px-2">نام</TableHead>
            <TableHead className="px-2">ایمیل</TableHead>
            <TableHead className="px-2">وضعیت</TableHead>
            <TableHead className="px-2">تیم‌ها</TableHead>
            <TableHead className="px-2 w-0 text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((u) => (
            <TableRow
              key={u.id}
              onClick={() => onRowClick?.(u)}
              className="bg-card hover:bg-accent cursor-pointer text-sm">
              {/* نام و شناسه */}
              <TableCell className="px-2 py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarFallback>
                      {(u.fullName || u.email || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{u.fullName || "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      #{u.id}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* ایمیل: پنهان در نمایش‌های خیلی کوچک */}
              <TableCell className="px-2 py-3 hidden md:table-cell">
                {u.email || "—"}
              </TableCell>

              {/* وضعیت */}
              <TableCell className="px-2 py-3">
                <UserStatusBadge status={u.status} />
              </TableCell>

              {/* تیم‌ها: نمایش از lg به بالا */}
              <TableCell className="px-2 py-3 hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {u.teams?.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      {t.name}
                    </span>
                  ))}
                  {u.teams && u.teams.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{u.teams.length - 3}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* عملیات */}
              <TableCell className="px-2 py-3 text-left w-0">
                {rowActions
                  ? (() => {
                      const props = rowActions(u);
                      return props ? <UsersRowActions {...props} /> : null;
                    })()
                  : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
