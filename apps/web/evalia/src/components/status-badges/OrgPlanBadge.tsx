"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { OrgPlanEnum, type OrgPlan } from "@/lib/enums";
import { Crown, Rocket, Building2, Factory } from "lucide-react";

function colorFor(plan: OrgPlan): string {
  switch (plan) {
    case "FREE":
      return "zinc";
    case "PRO":
      return "sky";
    case "BUSINESS":
      return "violet";
    case "ENTERPRISE":
    default:
      return "emerald";
  }
}
function iconFor(plan: OrgPlan) {
  const cls = "!h-3 !w-3 shrink-0 text-current";
  switch (plan) {
    case "FREE":
      return <Building2 className={cls} />;
    case "PRO":
      return <Rocket className={cls} />;
    case "BUSINESS":
      return <Factory className={cls} />;
    case "ENTERPRISE":
    default:
      return <Crown className={cls} />;
  }
}

export interface OrgPlanBadgeProps extends BadgeStyleOptions {
  plan: OrgPlan | null | undefined;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function OrgPlanBadge({
  plan,
  tone = "soft",
  size = "sm",
  withIcon = true,
  className,
  as,
}: OrgPlanBadgeProps) {
  const value = (
    plan && OrgPlanEnum.isEnum(plan) ? plan : null
  ) as OrgPlan | null;
  const label = OrgPlanEnum.t((value as any) || null) || "";
  const color = colorFor((value as any) || "FREE");
  const Comp: any = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon && value ? iconFor(value) : null}
       لایسنس <span>{label}</span>
    </Comp>
  );
}

export default OrgPlanBadge;
