import * as React from "react";
import { UserListItem } from "../types/users.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserStatusMenuBadge from "./UserStatusMenuBadge";
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
import { formatIranPhone } from "@/lib/utils";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import UserOrganizationsDropdown from "./UserOrganizationsDropdown";
import UserPlatformRolesCell from "./UserPlatformRolesCell";

export interface UsersTableProps {
  rows: UserListItem[];
  className?: string;
  rowActions?: (user: UserListItem) => UsersRowActionsProps | null;
  onRowClick?: (user: UserListItem) => void; // deprecated: edit should open only from actions menu
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
            <TableHead className="px-2">کاربر</TableHead>
            <TableHead className="px-2">شماره تماس</TableHead>
            <TableHead className="px-2">وضعیت</TableHead>
            <TableHead className="px-2">نقش‌های پلتفرم</TableHead>
            <TableHead className="px-2">سازمان‌ها</TableHead>
            <TableHead className="px-2 w-0 text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id} className="bg-card hover:bg-accent text-sm">
              {/* نام و شناسه */}
              <TableCell className="px-2 py-3">
                <div className="flex items-center gap-2">
                  <UserAvatarCell user={u} />
                  <div className="flex flex-col">
                    <span className="font-medium">{u.fullName || "—"}</span>
                    <span className="text-[11px] text-muted-foreground">
                      #{u.id}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* شماره تماس: پنهان در نمایش‌های خیلی کوچک */}
              <TableCell className="px-2 py-3 hidden md:table-cell">
                {u.phone ? formatIranPhone(u.phone) : "—"}
              </TableCell>

              {/* وضعیت */}
              <TableCell className="px-2 py-3">
                <UserStatusMenuBadge userId={u.id} status={u.status as any} />
              </TableCell>

              {/* نقش‌های پلتفرم */}
              <TableCell className="px-2 py-3 hidden md:table-cell">
                <UserPlatformRolesCell
                  userId={u.id}
                  roles={(u.globalRoles as any) || []}
                />
              </TableCell>

              {/* سازمان‌ها: نمایش منوی شمارش و لیست */}
              <TableCell className="px-2 py-3 hidden xl:table-cell">
                <UserOrganizationsDropdown orgs={u.organizations || []} />
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

function UserAvatarCell({ user }: { user: UserListItem }) {
  const raw = (user as any).avatarUrl || (user as any).avatar;
  const { src } = useAvatarImage(raw);
  const alt = user.fullName || user.email || String(user.id);
  const initials = (user.fullName || user.email || "?")
    ?.slice(0, 2)
    .toUpperCase();
  return (
    <Avatar className="size-8">
      {src ? <AvatarImage src={src} alt={alt} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
