"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { formatIranPhone } from "@/lib/utils";
import { UserStatusBadge, OrgRoleBadge } from "@/components/status-badges";
import { OrgRoleEnum } from "@/lib/enums";
import { MoreHorizontal, Users2, Phone } from "lucide-react";

export interface MemberRowProps {
  member: any;
  user: any;
  mutateRoles: (membershipId: number, roles: string[]) => void;
  onRemove: (membershipId: number, name: string) => void;
}

export function MemberRow({
  member,
  user,
  mutateRoles,
  onRemove,
}: MemberRowProps) {
  const fullName = user?.fullName || user?.name || "کاربر";
  const rawAvatar = user?.avatarUrl || user?.avatar;
  const { src: avatarSrc } = useAvatarImage(rawAvatar);
  const initials = String(fullName)
    .split(/\s+/)
    .filter(Boolean)
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roles: string[] = Array.isArray(member.roles) ? member.roles : [];

  return (
    <li
      className="h-full w-full rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-muted/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow px-4 pt-4 pb-3 focus-within:ring-2 ring-primary/40 flex flex-col gap-3"
      dir="rtl"
      aria-label={`عضو ${fullName}`}>
      <div className="flex items-start gap-4">
        <Avatar className="size-8 shrink-0">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt={fullName} /> : null}
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0 gap-1.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className="text-[13px] font-semibold truncate max-w-[25ch] tracking-tight"
              title={fullName}>
              {fullName}
            </span>
            <UserStatusBadge
              status={user?.status as any}
              tone="soft"
              size="xs"
            />
          </div>
          {user?.phone ? (
            <span
              className="inline-flex items-center w-fit gap-1.5 rounded-md bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground/90 ring-1 ring-inset ring-border/40"
              dir="ltr">
              <Phone className="h-3 w-3" />
              {formatIranPhone(user.phone)}
            </span>
          ) : null}
        </div>
        <div className="-mt-1">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-accent/70">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-56 p-1 text-[12px] mr-2">
              <DropdownMenuLabel className="text-[12px] inline-flex items-center gap-1 text-muted-foreground">
                <Users2 className="h-3.5 w-3.5" /> نقش‌های عضو
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {OrgRoleEnum.options().map((opt) => {
                const active = roles.includes(opt.value);
                return (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={active}
                    onCheckedChange={(v) => {
                      const next = v
                        ? Array.from(new Set([...roles, opt.value]))
                        : roles.filter((x: string) => x !== opt.value);
                      mutateRoles(member.id, next);
                    }}
                    className="flex items-center justify-between gap-2">
                    <span>{opt.label}</span>
                    <OrgRoleBadge
                      role={opt.value as any}
                      active={active}
                      tone={active ? "soft" : "outline"}
                      size="xs"
                    />
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-600"
                onSelect={() => onRemove(member.id, fullName)}>
                حذف عضو
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="h-px bg-border/60" />
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70 tracking-wide">
          <Users2 className="h-3.5 w-3.5" />
          <span>نقش‌ها</span>
        </div>
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {roles.length ? (
            roles.map((r: string) => (
              <OrgRoleBadge key={r} role={r as any} tone="soft" size="xs" />
            ))
          ) : (
            <span className="text-[10px] text-muted-foreground/70">
              نقش ثبت نشده
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
