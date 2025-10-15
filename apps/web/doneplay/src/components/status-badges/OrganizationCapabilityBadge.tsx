"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import {
  OrganizationCapabilityEnum,
  type OrganizationCapability,
} from "@/lib/enums";
import { Crown, ReceiptText, BarChart3 } from "lucide-react";

function colorFor(cap: OrganizationCapability, active: boolean = true): string {
  switch (cap) {
    case "MASTER":
      return active ? "emerald" : "zinc";
    case "BILLING_PROVIDER":
      return active ? "amber" : "zinc";
    case "ANALYTICS_HUB":
    default:
      return active ? "violet" : "zinc";
  }
}
function iconFor(cap: OrganizationCapability, size: "xs" | "sm" | "md") {
  const cls =
    (size === "xs"
      ? "!h-2.5 !w-2.5"
      : size === "md"
      ? "!h-3.5 !w-3.5"
      : "!h-3 !w-3") + " shrink-0 text-current";
  switch (cap) {
    case "MASTER":
      return <Crown className={cls} />;
    case "BILLING_PROVIDER":
      return <ReceiptText className={cls} />;
    case "ANALYTICS_HUB":
    default:
      return <BarChart3 className={cls} />;
  }
}

export interface OrganizationCapabilityBadgeProps extends BadgeStyleOptions {
  capability: OrganizationCapability | null | undefined;
  active?: boolean;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function OrganizationCapabilityBadge({
  capability,
  active = true,
  tone = "soft",
  size = "xs",
  withIcon = true,
  className,
  as,
}: OrganizationCapabilityBadgeProps) {
  const value = (
    capability && OrganizationCapabilityEnum.isEnum(capability)
      ? capability
      : null
  ) as OrganizationCapability | null;
  const label = OrganizationCapabilityEnum.t((value as any) || null) || "";
  const color = colorFor(((value as any) || "MASTER") as any, !!active);
  const Comp: any = as || Badge;
  const finalTone = active ? tone : tone === "solid" ? "soft" : tone;
  return (
    <Comp
      className={composeBadgeClass(color, {
        tone: finalTone,
        size,
        className,
      })}>
      {withIcon && value ? iconFor(value, size) : null}
      <span className={!active ? "opacity-70" : undefined}>{label}</span>
    </Comp>
  );
}

export default OrganizationCapabilityBadge;
