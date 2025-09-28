"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { PlatformRoleEnum, type PlatformRole } from "@/lib/enums";
import {
  Shield,
  ShieldCheck,
  UserCog,
  Sparkles,
  Headphones,
  HandCoins,
} from "lucide-react";

function colorFor(role: PlatformRole, active: boolean): string {
  switch (role) {
    case "SUPER_ADMIN":
      return active ? "emerald" : "zinc";
    case "ANALYSIS_MANAGER":
      return active ? "violet" : "zinc";
    case "FACILITATOR":
      return active ? "sky" : "zinc";
    case "SUPPORT":
      return active ? "amber" : "zinc";
    case "SALES":
      return active ? "teal" : "zinc";
    case "MEMBER":
    default:
      return active ? "slate" : "zinc";
  }
}
function iconFor(
  role: PlatformRole,
  active: boolean,
  size: "xs" | "sm" | "md"
) {
  const cls =
    (size === "xs"
      ? "!h-2.5 !w-2.5"
      : size === "md"
      ? "!h-3.5 !w-3.5"
      : "!h-3 !w-3") + " shrink-0 text-current";
  switch (role) {
    case "SUPER_ADMIN":
      return active ? (
        <ShieldCheck className={cls} />
      ) : (
        <Shield className={cls} />
      );
    case "ANALYSIS_MANAGER":
      return <Sparkles className={cls} />;
    case "FACILITATOR":
      return <UserCog className={cls} />;
    case "SUPPORT":
      return <Headphones className={cls} />;
    case "SALES":
      return <HandCoins className={cls} />;
    case "MEMBER":
    default:
      return <Shield className={cls} />;
  }
}

export interface PlatformRoleBadgeProps
  extends BadgeStyleOptions,
    Omit<React.HTMLAttributes<HTMLElement>, "role"> {
  role: PlatformRole | null | undefined;
  active?: boolean;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function PlatformRoleBadge({
  role,
  active = true,
  tone = "soft",
  size = "xs",
  withIcon = true,
  className,
  as,
  ...rest
}: PlatformRoleBadgeProps) {
  const value = (
    role && PlatformRoleEnum.isEnum(role) ? role : null
  ) as PlatformRole | null;
  const label = PlatformRoleEnum.t((value as any) || null) || "";
  const color = colorFor((value as any) || "MEMBER", !!active);
  const Comp: any = as || Badge;
  // inactive: use outline tone for a lighter visual, unless explicitly overridden
  const finalTone = active ? tone : tone === "solid" ? "soft" : tone;
  return (
    <Comp
      className={composeBadgeClass(color, {
        tone: finalTone,
        size,
        className,
      })}
      {...rest}>
      {withIcon && value ? iconFor(value, !!active, size) : null}
      <span className={!active ? "opacity-70" : undefined}>{label}</span>
    </Comp>
  );
}

export default PlatformRoleBadge;
