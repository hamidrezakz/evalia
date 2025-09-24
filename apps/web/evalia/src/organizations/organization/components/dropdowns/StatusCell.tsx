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
import { Loader2 } from "lucide-react";
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
          <button type="button">
            <OrganizationStatusBadge status={localStatus as any} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[9rem] p-1"
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
