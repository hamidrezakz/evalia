"use client";
import * as React from "react";
import { OrganizationStatusEnum } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { useChangeOrganizationStatusAction } from "../../api/organization-hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Loader2, ChevronDown } from "lucide-react";
import { OrganizationStatusBadge } from "../OrganizationStatusBadge";

interface StatusCellProps {
  orgId: number;
  status: string;
}

export function StatusCell({ orgId, status }: StatusCellProps) {
  const [open, setOpen] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState(status);
  const changeStatus = useChangeOrganizationStatusAction();
  const options = OrganizationStatusEnum.options();
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
      className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen} dir="rtl">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group inline-flex items-center gap-1 rounded-full pr-1 pl-1.5 h-6 text-[11px] focus:outline-none transition",
              "bg-transparent hover:bg-accent/60 hover:text-accent-foreground",
              open && "ring-1 ring-primary/40 bg-accent/60",
              "border border-transparent"
            )}>
            <OrganizationStatusBadge
              status={localStatus as any}
              className="px-2 py-0.5 text-[11px]"
            />
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="min-w-[9rem] p-1 mr-2 rounded-lg"
          onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="text-xs">
            وضعیت سازمان
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((opt) => {
            const active = opt.value === localStatus;
            const pending =
              changeStatus.isPending &&
              (changeStatus.variables as any)?.status === opt.value;
            return (
              <DropdownMenuItem
                key={opt.value}
                disabled={pending || active}
                className={cn(
                  "text-xs flex items-center justify-between gap-2 cursor-pointer",
                  active && "bg-accent text-accent-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (active) return;
                  const prev = localStatus;
                  setLocalStatus(opt.value);
                  changeStatus.mutate(
                    { id: orgId, status: opt.value as any },
                    { onError: () => setLocalStatus(prev) }
                  );
                }}>
                <span>{opt.label}</span>
                {pending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : active ? (
                  <span className="text-[9px] text-primary">فعلی</span>
                ) : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
export default StatusCell;
