"use client";
import * as React from "react";
import { OrgPlanEnum } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { useUpdateOrganization } from "../../api/organization-hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

interface PlanCellProps {
  orgId: number;
  plan: string;
}

export function PlanCell({ orgId, plan }: PlanCellProps) {
  const [open, setOpen] = React.useState(false);
  const [localPlan, setLocalPlan] = React.useState(plan);
  const updateOrg = useUpdateOrganization(orgId);
  const options = OrgPlanEnum.options();
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
              "rounded-md bg-muted px-1.5 py-0.5 text-xs inline-flex items-center gap-1 hover:bg-muted/70 transition-colors",
              open && "ring-1 ring-primary/30"
            )}>
            {OrgPlanEnum.t(localPlan as any) || localPlan}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[8rem] p-1"
          onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="text-xs">انتخاب پلن</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((opt) => {
            const active = opt.value === localPlan;
            const pending =
              updateOrg.isPending &&
              (updateOrg.variables as any)?.plan === opt.value;
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
                  setLocalPlan(opt.value);
                  updateOrg.mutate({ plan: opt.value } as any, {
                    onError: () => setLocalPlan(plan),
                  });
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
export default PlanCell;
