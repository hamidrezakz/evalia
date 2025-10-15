"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { OrganizationStatusEnum } from "@/lib/enums";
import OrgSelectCombobox from "@/globalcomboxs/OrgSelectCombobox";

export interface OrganizationsListHeaderProps {
  q: string;
  onSearch: (v: string) => void;
  status: string | null;
  onStatusChange: (v: string | null) => void;
  onAddClick: () => void;
  /** Selected parent organization id (when listing children) */
  parentOrganizationId?: number | null;
  /** Change handler for parent organization selection */
  onParentChange?: (parentOrgId: number | null) => void;
  /** Hide the parent selector UI (default: false) */
  hideParentSelector?: boolean;
}

export function OrganizationsListHeader({
  q,
  onSearch,
  status,
  onStatusChange,
  onAddClick,
  parentOrganizationId,
  onParentChange,
  hideParentSelector,
}: OrganizationsListHeaderProps) {
  const showParentSelector = !hideParentSelector;
  return (
    <div className="flex flex-col gap-3" dir="rtl">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو سازمان…"
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="جستجوی سازمان"
            className="pl-8 text-[12px] h-8 md:h-8 rounded-lg"
          />
        </div>
        {/* Parent Organization selector (optional) */}
        {showParentSelector && (
          <div className="w-full sm:max-w-xs">
            <OrgSelectCombobox
              parentsOnly
              value={parentOrganizationId ?? null}
              onChange={(id) => onParentChange?.(id)}
              placeholder="انتخاب سازمان مادر"
              className="h-8 md:h-8 rounded-lg min-w-[9rem] text-[12px] font-medium"
            />
          </div>
        )}
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              aria-label="فیلتر وضعیت سازمان"
              className="h-8 md:h-8 rounded-lg min-w-[9rem] justify-between text-[12px] font-medium">
              <span className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {status
                  ? OrganizationStatusEnum.t(status as any)
                  : "همه وضعیت‌ها"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 p-1">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              فیلتر وضعیت
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onStatusChange(null)}
              className="text-[12px] cursor-pointer">
              همه
            </DropdownMenuItem>
            {OrganizationStatusEnum.options().map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className="text-[12px] cursor-pointer">
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-1" />
        <Button
          onClick={onAddClick}
          aria-label="افزودن سازمان"
          className="h-8 md:h-8 rounded-lg gap-1 text-[12px] font-medium">
          <Plus className="h-4 w-4" /> افزودن سازمان
        </Button>
      </div>
      {status && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
          <span>
            فیلتر فعال: وضعیت = {OrganizationStatusEnum.t(status as any)}
          </span>
          <button
            onClick={() => onStatusChange(null)}
            className="px-2 py-0.5 rounded border border-muted-foreground/30 hover:bg-muted text-[10px]">
            حذف فیلتر
          </button>
        </div>
      )}
    </div>
  );
}
