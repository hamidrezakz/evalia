import * as React from "react";

import { Filter, ListFilter, Search, Building2, X, Plus } from "lucide-react";

import { SessionStateEnum } from "@/lib/enums";
import { cn } from "@/lib/utils";
import {
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelAction,
} from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import OrganizationCombobox from "@/assessment/components/combobox/OrganizationCombobox";

export type SessionManagerHeaderProps = {
  isScoped: boolean;
  filteredCount: number;
  stateFilters: string[];
  onStateFiltersChange: (filters: string[]) => void;
  toolbarOpen: boolean;
  onToolbarToggle: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedOrgId: number | null;
  onOrganizationChange: (id: number | null) => void;
  scopedOrganizationName?: string | null;
  canCreateSession: boolean;
  onCreateSession: () => void;
  onClearFilters: () => void;
  organizationLoading?: boolean;
};

export function SessionManagerHeader({
  isScoped,
  filteredCount,
  stateFilters,
  onStateFiltersChange,
  toolbarOpen,
  onToolbarToggle,
  search,
  onSearchChange,
  selectedOrgId,
  onOrganizationChange,
  scopedOrganizationName,
  canCreateSession,
  onCreateSession,
  onClearFilters,
  organizationLoading,
}: SessionManagerHeaderProps) {
  const hasStateFilters = stateFilters.length > 0;

  const stateFilterOptions = React.useMemo(() => SessionStateEnum.values, []);

  function handleStateToggle(st: string) {
    onStateFiltersChange(
      stateFilters.includes(st)
        ? stateFilters.filter((x) => x !== st)
        : [...stateFilters, st]
    );
  }

  return (
    <PanelHeader className="p-4 pb-2 border-b border-border/50 flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <PanelTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
              Σ
            </span>
            جلسات ارزیابی
          </PanelTitle>
          <PanelDescription className="text-xs text-muted-foreground/80 hidden sm:block">
            مدیریت، جستجو و فیلتر جلسات سنجش
          </PanelDescription>
        </div>
        {!isScoped && canCreateSession && (
          <PanelAction className="w-full sm:w-auto">
            <Button
              size="sm"
              className="h-9 px-3 w-full sm:w-auto"
              onClick={onCreateSession}>
              <Plus className="h-4 w-4 ms-1" />
              <span className="hidden sm:inline">افزودن جلسه</span>
              <span className="sm:hidden">افزودن</span>
            </Button>
          </PanelAction>
        )}
      </div>

      <div className="flex items-center justify-between w-full gap-2">
        {filteredCount > 0 ? (
          <span className="text-[11px] px-2 py-1 rounded-md bg-muted/40 text-foreground/70">
            {filteredCount.toLocaleString()} جلسه
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {hasStateFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="حذف فیلترها"
              onClick={onClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className={cn("h-8 w-8", toolbarOpen ? "bg-primary/10" : "")}
            onClick={onToolbarToggle}
            title="فیلترها / جستجو">
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid w-full gap-3 transition-all duration-300 md:grid-cols-3 md:items-center",
          toolbarOpen
            ? "grid-cols-1 opacity-100"
            : "grid-cols-1 md:opacity-100",
          toolbarOpen
            ? "max-h-[400px]"
            : "max-h-0 md:max-h-full overflow-hidden md:overflow-visible"
        )}>
        <div className="relative flex items-center h-9">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی جلسه..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-8 h-9 bg-background/60 focus-visible:ring-1 text-sm"
          />
        </div>
        <div className="flex items-center h-9">
          {isScoped ? (
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border bg-muted/40 w-full">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {scopedOrganizationName ||
                  (selectedOrgId ? `سازمان #${selectedOrgId}` : "سازمان")}
              </span>
            </div>
          ) : (
            <OrganizationCombobox
              value={selectedOrgId}
              onChange={onOrganizationChange}
              placeholder={
                organizationLoading ? "در حال بارگذاری..." : "انتخاب سازمان"
              }
              className="w-full h-9"
            />
          )}
        </div>
        <div className="flex items-center h-9">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant={stateFilters.length ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 w-full justify-between px-3 text-xs font-medium",
                  stateFilters.length
                    ? "bg-primary text-primary-foreground"
                    : ""
                )}>
                <span className="flex items-center gap-1">
                  <Filter className="h-4 w-4" /> وضعیت‌ها
                </span>
                {stateFilters.length ? (
                  <span className="inline-flex items-center rounded-md bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-semibold">
                    {stateFilters.length}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[10px]">همه</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-60 max-h-[320px] overflow-auto">
              <DropdownMenuLabel className="text-xs">
                انتخاب وضعیت‌ها
              </DropdownMenuLabel>
              {stateFilterOptions.map((state) => {
                const checked = stateFilters.includes(state);
                return (
                  <DropdownMenuItem
                    key={state}
                    onClick={(event) => {
                      event.preventDefault();
                      handleStateToggle(state);
                    }}
                    className="flex items-center gap-2 text-[11px] py-1.5">
                    <Checkbox checked={checked} className="ms-1" />
                    {SessionStateEnum.t(state)}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onClearFilters}
                className="text-[11px] py-1.5">
                حذف فیلترها
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </PanelHeader>
  );
}

export default SessionManagerHeader;
