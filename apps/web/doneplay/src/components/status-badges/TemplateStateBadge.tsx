"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { z } from "zod";
import { FileEdit, PlayCircle, Lock, Archive } from "lucide-react";

// Keep in sync with assessment/types/templates.types.ts (TemplateState)
export const TemplateStateEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
]);
export type TemplateState = z.infer<typeof TemplateStateEnum>;

function colorFor(state: TemplateState): string {
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
function iconFor(state: TemplateState) {
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

export interface TemplateStateBadgeProps extends BadgeStyleOptions {
  state: TemplateState | null | undefined;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function TemplateStateBadge({
  state,
  tone = "soft",
  size = "sm",
  withIcon = true,
  className,
  as,
}: TemplateStateBadgeProps) {
  const value = (
    TemplateStateEnum.safeParse(state).success ? state : null
  ) as TemplateState | null;
  const labelMap: Record<TemplateState, string> = {
    DRAFT: "پیش‌نویس",
    ACTIVE: "فعال",
    CLOSED: "بسته",
    ARCHIVED: "آرشیو",
  } as const;
  const label = value ? labelMap[value] : "";
  const color = colorFor(((value as any) || "DRAFT") as any);
  const Comp: any = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon && value ? iconFor(value) : null}
      <span>{label}</span>
    </Comp>
  );
}

export default TemplateStateBadge;
