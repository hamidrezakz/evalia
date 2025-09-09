import * as React from "react";
import { UserListItem } from "../types/users.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserStatusBadge } from "./UserStatusBadge";
import { UsersRowActions, UsersRowActionsProps } from "./UsersRowActions";
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
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-right text-sm text-muted-foreground">
            <th className="px-2">نام</th>
            <th className="px-2">ایمیل</th>
            <th className="px-2">وضعیت</th>
            <th className="px-2">تیم‌ها</th>
            <th className="px-2 w-0">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr
              key={u.id}
              onClick={() => onRowClick?.(u)}
              className="bg-card hover:bg-accent cursor-pointer text-sm">
              <td className="px-2 py-3">
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
              </td>
              <td className="px-2 py-3">{u.email || "—"}</td>
              <td className="px-2 py-3">
                <UserStatusBadge status={u.status} />
              </td>
              <td className="px-2 py-3">
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
              </td>
              <td className="px-2 py-3 text-left">
                {rowActions
                  ? (() => {
                      const props = rowActions(u);
                      return props ? <UsersRowActions {...props} /> : null;
                    })()
                  : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
