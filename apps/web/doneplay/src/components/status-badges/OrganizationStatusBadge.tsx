"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { OrganizationStatusEnum, type OrganizationStatus } from "@/lib/enums";
import { Building2, ShieldAlert, Archive } from "lucide-react";

function colorFor(status: OrganizationStatus): string {
  switch (status) {
    case "ACTIVE":
      return "emerald";
    case "SUSPENDED":
      return "amber";
    case "ARCHIVED":
    default:
      return "zinc";
  }
}
function iconFor(status: OrganizationStatus) {
  const cls = "!h-3 !w-3 shrink-0 text-current";
  switch (status) {
    case "ACTIVE":
      return <Building2 className={cls} />;
    case "SUSPENDED":
      return <ShieldAlert className={cls} />;
    case "ARCHIVED":
    default:
      return <Archive className={cls} />;
  }
}

export interface OrganizationStatusBadgeProps extends BadgeStyleOptions {
  status: OrganizationStatus | null | undefined;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function OrganizationStatusBadge({
  status,
  tone = "soft",
  size = "sm",
  withIcon = true,
  className,
  as,
}: OrganizationStatusBadgeProps) {
  const value = (
    status && OrganizationStatusEnum.isEnum(status) ? status : null
  ) as OrganizationStatus | null;
  const label = OrganizationStatusEnum.t((value as any) || null) || "";
  const color = colorFor((value as any) || "ARCHIVED");
  const Comp: any = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon && value ? iconFor(value) : null}
      <span>{label}</span>
    </Comp>
  );
}

export default OrganizationStatusBadge;
