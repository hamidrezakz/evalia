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
import { cn, formatIranPhone } from "@/lib/utils";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import UserOrganizationsDropdown from "./UserOrganizationsDropdown";
import UserPlatformRolesCell from "./UserPlatformRolesCell";
import { Phone, Shield, Building2, Circle } from "lucide-react";

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
      {/* Mobile card list (mirrors style of OrganizationsTable) */}
      <ul className="space-y-4 md:hidden" dir="rtl">
        {rows.map((u) => (
          <li
            key={u.id}
            className="card-surface card-surface-focus px-4 pt-4 pb-3 flex flex-col gap-3">
            <div className="flex items-start gap-4">
              <UserAvatarCell user={u} />
              <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[13px] font-semibold truncate max-w-[25ch] tracking-tight"
                    title={u.fullName || undefined}>
                    {u.fullName || "—"}
                  </span>
                  <UserStatusMenuBadge userId={u.id} status={u.status as any} />
                </div>
                {u.phone ? (
                  <span
                    className="inline-flex items-center w-fit gap-1.5 rounded-md bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground/90 ring-1 ring-inset ring-border/40"
                    dir="ltr">
                    <Phone className="h-3 w-3" />
                    {formatIranPhone(u.phone)}
                  </span>
                ) : null}
              </div>

              {rowActions
                ? (() => {
                    const props = rowActions(u);
                    return props ? <UsersRowActions {...props} /> : null;
                  })()
                : null}
            </div>
            <div className="h-px bg-border/60" />
            {(() => {
              const statusColorMap: Record<string, string> = {
                ACTIVE: "text-emerald-500",
                SUSPENDED: "text-amber-500",
                DISABLED: "text-rose-500",
                PENDING: "text-sky-500",
              };
              const statusColor =
                statusColorMap[u.status as string] || "text-muted-foreground";
              return (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[10px]">
                  <InfoField
                    icon={
                      <Shield className="h-3 w-3 text-muted-foreground/70" />
                    }
                    label="نقش‌ها">
                    <UserPlatformRolesCell
                      userId={u.id}
                      roles={(u.globalRoles as any) || []}
                    />
                  </InfoField>
                  <InfoField
                    icon={
                      <Building2 className="h-3 w-3 text-muted-foreground/70" />
                    }
                    label="سازمان‌ها">
                    <UserOrganizationsDropdown
                      className="test-[9px] py-0"
                      orgs={u.organizations || []}
                    />
                  </InfoField>
                </div>
              );
            })()}
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <Table className="hidden md:table w-full text-sm" dir="rtl">
        <TableHeader>
          <TableRow className="text-xs uppercase tracking-wide text-muted-foreground/80 border-b">
            <TableHead className="px-3 py-2 font-medium">کاربر</TableHead>
            <TableHead className="px-3 py-2 font-medium">شماره تماس</TableHead>
            <TableHead className="px-3 py-2 font-medium">وضعیت</TableHead>
            <TableHead className="px-3 py-2 font-medium">
              نقش‌های پلتفرم
            </TableHead>
            <TableHead className="px-3 py-2 font-medium hidden lg:table-cell">
              سازمان‌ها
            </TableHead>
            <TableHead className="px-3 py-2 font-medium w-0 text-left">
              عملیات
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => (
            <TableRow
              key={u.id}
              className="group hover:bg-accent/50 focus-visible:outline-none border-b last:border-b-0 transition-colors align-top">
              <TableCell className="px-3 py-3 align-top">
                <div className="flex items-start gap-3 min-w-0">
                  <UserAvatarCell user={u} />
                  <div className="flex flex-col min-w-0">
                    <span
                      className="font-medium truncate max-w-[20ch]"
                      title={u.fullName || undefined}>
                      {u.fullName || "—"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      @{u.id}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 py-3 align-top">
                {u.phone ? formatIranPhone(u.phone) : "—"}
              </TableCell>
              <TableCell className="px-3 py-3 align-top">
                <UserStatusMenuBadge userId={u.id} status={u.status as any} />
              </TableCell>
              <TableCell className="px-3 py-3 align-top">
                <UserPlatformRolesCell
                  userId={u.id}
                  roles={(u.globalRoles as any) || []}
                />
              </TableCell>
              <TableCell className="px-3 py-3 align-top hidden lg:table-cell">
                <UserOrganizationsDropdown
                  className="test-[9px] py-0.5"
                  orgs={u.organizations || []}
                />
              </TableCell>
              <TableCell className="px-3 py-3 align-top text-left w-0">
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

function InfoField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-fit flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70 tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 min-w-0">{children}</div>
    </div>
  );
}
