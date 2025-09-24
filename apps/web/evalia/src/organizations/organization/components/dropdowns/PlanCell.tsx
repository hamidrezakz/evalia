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
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-6 pl-2 pr-1 gap-1 text-[11px] font-medium bg-muted/60 hover:bg-muted/80 border-muted-foreground/20 inline-flex items-center",
              open && "ring-1 ring-primary/30"
            )}>
            <span>{OrgPlanEnum.t(localPlan as any) || localPlan}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="min-w-[8rem] p-1 mr-2"
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
