"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { SessionStateEnum, type SessionState } from "@/lib/enums";
import {
  CalendarClock,
  Timer,
  Cpu,
  CheckCircle2,
  XOctagon,
} from "lucide-react";

function colorFor(state: SessionState): string {
  switch (state) {
    case "SCHEDULED":
      return "sky";
    case "IN_PROGRESS":
      return "emerald";
    case "ANALYZING":
      return "violet";
    case "COMPLETED":
      return "teal";
    case "CANCELLED":
    default:
      return "zinc";
  }
}
function iconFor(state: SessionState) {
  const cls = "h-3 w-3";
  switch (state) {
    case "SCHEDULED":
      return <CalendarClock className={cls} />;
    case "IN_PROGRESS":
      return <Timer className={cls} />;
    case "ANALYZING":
      return <Cpu className={cls} />;
    case "COMPLETED":
      return <CheckCircle2 className={cls} />;
    case "CANCELLED":
    default:
      return <XOctagon className={cls} />;
  }
}

export interface SessionStateBadgeProps extends BadgeStyleOptions {
  state: SessionState | null | undefined;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function SessionStateBadge({
  state,
  tone = "soft",
  size = "sm",
  withIcon = true,
  className,
  as,
}: SessionStateBadgeProps) {
  const value = (
    state && SessionStateEnum.isEnum(state) ? state : null
  ) as SessionState | null;
  const label = SessionStateEnum.t((value as any) || null) || "";
  const color = colorFor((value as any) || "SCHEDULED");
  const Comp: any = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon && value ? iconFor(value) : null}
      <span>{label}</span>
    </Comp>
  );
}

export default SessionStateBadge;
