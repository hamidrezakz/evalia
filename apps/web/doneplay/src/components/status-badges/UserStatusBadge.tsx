"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { UserStatusEnum, type UserStatus } from "@/lib/enums";
import { CheckCircle2, Clock4, UserX2, PauseOctagon } from "lucide-react";

function colorFor(status: UserStatus): string {
  switch (status) {
    case "ACTIVE":
      return "emerald";
    case "INVITED":
      return "sky";
    case "SUSPENDED":
      return "amber";
    case "DELETED":
    default:
      return "zinc";
  }
}

function iconFor(status: UserStatus, size: "xs" | "sm" | "md") {
  const cls =
    size === "xs" ? "h-2.5 w-2.5" : size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  switch (status) {
    case "ACTIVE":
      return <CheckCircle2 className={cls} />;
    case "INVITED":
      return <Clock4 className={cls} />;
    case "SUSPENDED":
      return <PauseOctagon className={cls} />;
    case "DELETED":
    default:
      return <UserX2 className={cls} />;
  }
}

export interface UserStatusBadgeProps extends BadgeStyleOptions {
  status: UserStatus | null | undefined;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function UserStatusBadge({
  status,
  tone = "soft",
  size = "sm",
  withIcon = true,
  className,
  as,
}: UserStatusBadgeProps) {
  const value = (
    status && UserStatusEnum.isEnum(status) ? status : null
  ) as UserStatus | null;
  const label = UserStatusEnum.t((value as any) || null) || "";
  const color = colorFor((value as any) || "DELETED");
  const Comp: any = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon && value ? iconFor(value, size) : null}
      <span>{label}</span>
    </Comp>
  );
}

export default UserStatusBadge;
