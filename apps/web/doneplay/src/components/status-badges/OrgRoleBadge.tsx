"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { OrgRoleEnum, type OrgRole } from "@/lib/enums";
import { Crown, ClipboardList, Users } from "lucide-react";

function colorFor(role: OrgRole, active: boolean): string {
  switch (role) {
    case "OWNER":
      return active ? "emerald" : "zinc";
    case "MANAGER":
      return active ? "violet" : "zinc";
    case "MEMBER":
    default:
      return active ? "sky" : "zinc";
  }
}
function iconFor(role: OrgRole, size: "xs" | "sm" | "md") {
  const cls =
    (size === "xs"
      ? "!h-2.5 !w-2.5"
      : size === "md"
      ? "!h-3.5 !w-3.5"
      : "!h-3 !w-3") + " shrink-0 text-current";
  switch (role) {
    case "OWNER":
      return <Crown className={cls} />;
    case "MANAGER":
      return <ClipboardList className={cls} />;
    case "MEMBER":
    default:
      return <Users className={cls} />;
  }
}

export interface OrgRoleBadgeProps
  extends BadgeStyleOptions,
    Omit<React.HTMLAttributes<HTMLElement>, "role"> {
  role: OrgRole | null | undefined;
  active?: boolean;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function OrgRoleBadge({
  role,
  active = true,
  tone = "soft",
  size = "xs",
  withIcon = true,
  className,
  as,
  ...rest
}: OrgRoleBadgeProps) {
  const value = (
    role && OrgRoleEnum.isEnum(role) ? role : null
  ) as OrgRole | null;
  const label = OrgRoleEnum.t((value as any) || null) || "";
  const color = colorFor((value as any) || "MEMBER", !!active);
  const Comp: any = as || Badge;
  const finalTone = active ? tone : tone === "solid" ? "soft" : tone;
  return (
    <Comp
      className={composeBadgeClass(color, {
        tone: finalTone,
        size,
        className,
      })}
      {...rest}>
      {withIcon && value ? iconFor(value, size) : null}
      <span className={!active ? "opacity-70" : undefined}>{label}</span>
    </Comp>
  );
}

export default OrgRoleBadge;
