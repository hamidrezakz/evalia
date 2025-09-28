"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import {
  CheckCircle2,
  Loader2,
  CircleDashed,
  CircleOff,
  Timer,
} from "lucide-react";

export type AssignmentProgressStatus =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "NOT_STARTED"
  | "NO_QUESTIONS"
  | "NOT_ASSIGNED";

function colorFor(status: AssignmentProgressStatus): string {
  switch (status) {
    case "COMPLETED":
      return "emerald";
    case "IN_PROGRESS":
      return "amber";
    case "NOT_STARTED":
      return "zinc";
    case "NO_QUESTIONS":
      return "slate";
    case "NOT_ASSIGNED":
    default:
      return "rose";
  }
}

function iconFor(status: AssignmentProgressStatus) {
  const cls = "h-3 w-3";
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className={cls} />;
    case "IN_PROGRESS":
      return <Timer className={cls} />;
    case "NOT_STARTED":
      return <CircleDashed className={cls} />;
    case "NO_QUESTIONS":
      return <CircleOff className={cls} />;
    case "NOT_ASSIGNED":
    default:
      return <Loader2 className={cls} />;
  }
}

function labelFa(status: AssignmentProgressStatus): string {
  switch (status) {
    case "COMPLETED":
      return "تکمیل";
    case "IN_PROGRESS":
      return "در حال انجام";
    case "NOT_STARTED":
      return "شروع نشده";
    case "NO_QUESTIONS":
      return "بدون سوال";
    case "NOT_ASSIGNED":
    default:
      return "بدون اختصاص";
  }
}

export interface AssignmentProgressBadgeProps extends BadgeStyleOptions {
  status: AssignmentProgressStatus | null | undefined;
  percent?: number | null;
  withIcon?: boolean;
  showPercent?: boolean;
  as?: React.ElementType;
}

export function AssignmentProgressBadge({
  status,
  percent,
  withIcon = true,
  showPercent = true,
  tone = "soft",
  size = "xs",
  className,
  as,
}: AssignmentProgressBadgeProps) {
  const value: AssignmentProgressStatus = status || "NOT_ASSIGNED";
  const color = colorFor(value);
  const Comp: React.ElementType = as || Badge;
  const pct =
    typeof percent === "number" ? Math.min(100, Math.max(0, percent)) : null;
  return (
    <Comp
      className={composeBadgeClass(color, {
        tone,
        size,
        className,
      })}
      title={pct !== null ? `${labelFa(value)} – ${pct}%` : labelFa(value)}>
      {withIcon && iconFor(value)}
      <span>{labelFa(value)}</span>
      {showPercent && pct !== null && (
        <span className="tabular-nums">{pct}%</span>
      )}
    </Comp>
  );
}

export default AssignmentProgressBadge;
