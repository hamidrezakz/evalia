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
import { MoreHorizontal, Users2 } from "lucide-react";

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
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      {/* Identity (avatar + name + phone). Text truncates, never wraps to next line */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Avatar className="size-7 shrink-0">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt={fullName} /> : null}
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div
            className="font-medium text-sm truncate gap-2 flex-row"
            title={fullName}>
            <span>{fullName}</span>
            <div className="inline-flex items-center mr-2">
              <UserStatusBadge
                status={user?.status as any}
                tone="soft"
                size="xs"
              />
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {user?.phone ? formatIranPhone(user?.phone) : "—"}
          </div>
        </div>
      </div>

      {/* Badges (roles) and menu. Badges wrap nicely on small screens */}
      <div className="flex flex-wrap items-center gap-1">
        {(member.roles || []).map((r: string) => (
          <OrgRoleBadge key={r} role={r as any} tone="soft" size="xs" />
        ))}
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56 p-1 text-[12px] mr-2">
            <DropdownMenuLabel className="text-[12px] inline-flex items-center gap-1 text-muted-foreground">
              <Users2 className="h-3.5 w-3.5" /> نقش‌های عضو
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {OrgRoleEnum.options().map((opt) => {
              const active = (member.roles || []).includes(opt.value);
              return (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={active}
                  onCheckedChange={(v) => {
                    const next = v
                      ? Array.from(
                          new Set([...(member.roles || []), opt.value])
                        )
                      : (member.roles || []).filter(
                          (x: string) => x !== opt.value
                        );
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
  );
}
