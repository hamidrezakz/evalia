"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Shield, Filter, ChevronDown } from "lucide-react";
import Combobox from "@/components/ui/combobox";
import { UserStatusEnum, PlatformRoleEnum } from "@/lib/enums";
import { UserStatusBadge } from "@/components/status-badges/UserStatusBadge";
import { PlatformRoleBadge } from "@/components/status-badges";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import UserUpsertDialog from "./UserUpsertDialog";

export interface UsersListHeaderProps {
  q: string;
  onSearch: (v: string) => void;
  status: string | null;
  onStatusChange: (v: string | null) => void;
  orgFilter: number | null;
  onOrgChange: (v: number | null) => void;
  roleFilter: string[];
  onRoleToggle: (role: string) => void;
  onRoleReset: () => void;
  orgItems: { id: number; name: string }[];
  orgsLoading: boolean;
  orgsError: boolean;
  onOrgRefetch: () => void;
  onCreateSuccess: () => void;
}

export function UsersListHeader(props: UsersListHeaderProps) {
  const {
    q,
    onSearch,
    status,
    onStatusChange,
    orgFilter,
    onOrgChange,
    roleFilter,
    onRoleToggle,
    onRoleReset,
    orgItems,
    orgsLoading,
    orgsError,
    onOrgRefetch,
    onCreateSuccess,
  } = props;
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو..."
            aria-label="جستجوی کاربر"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 text-[12px] h-8 md:h-8 rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center flex-row flex-wrap gap-2 xl:gap-3 -mx-0.5">
        {/* Status */}
        <div className="min-w-44">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                aria-label="فیلتر وضعیت"
                className="justify-between w-full h-8 px-3 text-[12px] font-medium flex items-center gap-2 group rounded-lg">
                <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                {status ? (
                  <div className="flex items-center gap-2">
                    <UserStatusBadge
                      status={status as any}
                      size="xs"
                      tone="soft"
                    />
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    همه وضعیت‌ها
                    <ChevronDown className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52 p-1">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                فیلتر وضعیت کاربر
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!status}
                onCheckedChange={() => onStatusChange(null)}>
                <span className="text-[12px]">همه</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {UserStatusEnum.options().map((opt) => {
                const active = status === opt.value;
                return (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={active}
                    onCheckedChange={(v) =>
                      onStatusChange(v ? opt.value : null)
                    }
                    className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <UserStatusBadge
                        status={opt.value as any}
                        size="xs"
                        tone={active ? "solid" : "soft"}
                      />
                    </div>
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Organizations */}
        <div className="min-w-56">
          <div className="flex flex-col gap-1">
            <Combobox
              items={[{ id: 0, name: "همه سازمان‌ها" }, ...orgItems]}
              value={orgFilter ?? 0}
              onChange={(val) => {
                const n = Number(val);
                onOrgChange(n && Number.isFinite(n) ? n : null);
              }}
              placeholder="سازمان"
              aria-label="فیلتر سازمان"
              getKey={(it) => (it as any).id}
              getLabel={(it) => (it as any).name}
              loading={orgsLoading}
              disabled={orgsLoading}
              emptyText={
                orgsLoading
                  ? "در حال بارگذاری..."
                  : orgsError
                  ? "خطا - دوباره تلاش کنید"
                  : "سازمانی یافت نشد"
              }
              className="text-[12px] h-8 rounded-lg"
            />
            {orgsError ? (
              <div className="flex items-center gap-2 text-[10px] text-rose-500">
                <span>دریافت سازمان‌ها ناموفق بود.</span>
                <button
                  type="button"
                  onClick={onOrgRefetch}
                  className="underline decoration-dotted">
                  تلاش مجدد
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {/* Platform roles */}
        <div className="min-w-10">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="فیلتر نقش‌ها"
                className="h-8 w-8 relative rounded-lg">
                <Shield className="size-4" />
                {roleFilter.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] min-w-4 h-4 px-1">
                    {roleFilter.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-60 p-1 text-[12px]">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                فیلتر نقش‌های پلتفرمی
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PlatformRoleEnum.options().map((opt) => {
                const checked = roleFilter.includes(opt.value);
                return (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={checked}
                    onCheckedChange={(v) => onRoleToggle(opt.value)}>
                    <div className="flex items-center gap-2">
                      <PlatformRoleBadge
                        role={opt.value as any}
                        active={checked}
                        size="xs"
                        tone={checked ? "solid" : "soft"}
                      />
                    </div>
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={roleFilter.length === 0}
                onCheckedChange={(v) => v && onRoleReset()}>
                <span className="text-[12px]">نمایش همه نقش‌ها</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Create */}
        <div className="lg:ms-auto">
          <UserUpsertDialog
            mode="create"
            restrictToActiveOrg={false}
            open={createOpen}
            onOpenChange={setCreateOpen}
            onSuccess={() => {
              setCreateOpen(false);
              onCreateSuccess();
            }}
            trigger={
              <Button
                icon={<Plus className="h-4 w-4" />}
                aria-label="افزودن کاربر"
                className="h-8 text-[12px] font-medium rounded-lg">
                افزودن کاربر
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
