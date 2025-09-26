"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { AssessmentStateEnum, type AssessmentState } from "@/lib/enums";
import { FileEdit, PlayCircle, Lock, Archive } from "lucide-react";

function colorFor(state: AssessmentState): string {
  switch (state) {
    case "DRAFT":
      return "zinc";
    case "ACTIVE":
      return "emerald";
    case "CLOSED":
      return "sky";
    case "ARCHIVED":
    default:
      return "slate";
  }
}
function iconFor(state: AssessmentState) {
  const cls = "h-3 w-3";
  switch (state) {
    case "DRAFT":
      return <FileEdit className={cls} />;
    case "ACTIVE":
      return <PlayCircle className={cls} />;
    case "CLOSED":
      return <Lock className={cls} />;
    case "ARCHIVED":
    default:
      return <Archive className={cls} />;
  }
}

export interface AssessmentStateBadgeProps extends BadgeStyleOptions {
  state: AssessmentState | null | undefined;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function AssessmentStateBadge({
  state,
  tone = "soft",
  size = "sm",
  withIcon = true,
  className,
  as,
}: AssessmentStateBadgeProps) {
  const value = (
    state && AssessmentStateEnum.isEnum(state) ? state : null
  ) as AssessmentState | null;
  const label = AssessmentStateEnum.t((value as any) || null) || "";
  const color = colorFor((value as any) || "DRAFT");
  const Comp: any = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon && value ? iconFor(value) : null}
      <span>{label}</span>
    </Comp>
  );
}

export default AssessmentStateBadge;
