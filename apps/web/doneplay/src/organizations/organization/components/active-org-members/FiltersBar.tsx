"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { UserStatusBadge, OrgRoleBadge } from "@/components/status-badges";
import { ChevronDown, Users2, UserRound, Search, Plus } from "lucide-react";
import UserUpsertDialog from "@/users/components/UserUpsertDialog";
import { OrgRoleEnum, UserStatusEnum } from "@/lib/enums";

export interface FiltersBarProps {
  q: string;
  setQ: (v: string) => void;
  status: string | null;
  setStatus: (v: string | null) => void;
  roleFilter: string[];
  setRoleFilter: (fn: (prev: string[]) => string[]) => void;
}

export function FiltersBar({
  q,
  setQ,
  status,
  setStatus,
  roleFilter,
  setRoleFilter,
}: FiltersBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-end">
      <div className="flex-1 min-w-0">
        <Label className="mb-1 hidden sm:block">جستجو</Label>
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام اعضای سازمان..."
            className="pl-8"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="min-w-40">
        <Label className="mb-1 hidden sm:block">وضعیت</Label>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full h-9 justify-between">
              <span className="inline-flex items-center gap-1">
                {status ? (
                  <UserStatusBadge
                    status={status as any}
                    tone="soft"
                    size="xs"
                  />
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 text-[12px]">
                    همه وضعیت‌ها
                  </span>
                )}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56 p-1">
            <DropdownMenuLabel className="text-[12px] inline-flex items-center gap-1 text-muted-foreground">
              <UserRound className="h-3.5 w-3.5" /> فیلتر وضعیت کاربران
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setStatus(null)}
              className="text-[12px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 text-muted-foreground px-2 py-0.5">
                همه وضعیت‌ها
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {UserStatusEnum.options().map((o) => {
              const active = status === o.value;
              return (
                <DropdownMenuItem
                  key={o.value}
                  onSelect={() => setStatus(o.value)}
                  className="text-[12px] flex items-center justify-between gap-2">
                  <UserStatusBadge
                    status={o.value as any}
                    tone={active ? "solid" : "soft"}
                    size="xs"
                  />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="min-w-48">
        <Label className="mb-1 hidden sm:block">نقش‌های سازمانی</Label>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full h-9 justify-between">
              <span className="text-sm">
                {roleFilter.length ? `${roleFilter.length} نقش` : "همه نقش‌ها"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56 p-1 text-[12px]">
            <DropdownMenuLabel className="text-[12px] inline-flex items-center gap-1 text-muted-foreground">
              <Users2 className="h-3.5 w-3.5" /> فیلتر نقش‌های سازمانی
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {OrgRoleEnum.options().map((opt) => {
              const active = roleFilter.includes(opt.value);
              return (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={active}
                  onCheckedChange={(v) =>
                    setRoleFilter((prev) =>
                      v
                        ? Array.from(new Set([...(prev || []), opt.value]))
                        : (prev || []).filter((x) => x !== opt.value)
                    )
                  }
                  className="flex items-center justify-between gap-2">
                  <OrgRoleBadge
                    role={opt.value as any}
                    active={active}
                    tone={active ? "solid" : "soft"}
                    size="xs"
                  />
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="min-w-fit md:self-end">
        <UserUpsertDialog
          mode="create"
          restrictToActiveOrg
          trigger={
            <Button className="h-9" icon={<Plus className="h-4 w-4" />}>
              افزودن کاربر
            </Button>
          }
        />
      </div>
    </div>
  );
}
