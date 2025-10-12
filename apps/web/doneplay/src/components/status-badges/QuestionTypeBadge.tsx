"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { QuestionTypeEnum, type QuestionType } from "@/lib/enums";
import {
  Ruler,
  Type as TextIcon,
  ListChecks,
  CheckSquare,
  CheckCircle2,
} from "lucide-react";

function colorFor(type: QuestionType): string {
  switch (type) {
    case "SCALE":
      return "teal";
    case "TEXT":
      return "slate";
    case "MULTI_CHOICE":
      return "violet";
    case "SINGLE_CHOICE":
      return "sky";
    case "BOOLEAN":
    default:
      return "amber";
  }
}
function iconFor(type: QuestionType) {
  const cls = "h-3 w-3";
  switch (type) {
    case "SCALE":
      return <Ruler className={cls} />;
    case "TEXT":
      return <TextIcon className={cls} />;
    case "MULTI_CHOICE":
      return <ListChecks className={cls} />;
    case "SINGLE_CHOICE":
      return <CheckSquare className={cls} />;
    case "BOOLEAN":
    default:
      return <CheckCircle2 className={cls} />;
  }
}

export interface QuestionTypeBadgeProps extends BadgeStyleOptions {
  type: QuestionType | null | undefined;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function QuestionTypeBadge({
  type,
  tone = "soft",
  size = "sm",
  withIcon = true,
  className,
  as,
}: QuestionTypeBadgeProps) {
  const value = (
    type && QuestionTypeEnum.isEnum(type) ? type : null
  ) as QuestionType | null;
  const label = QuestionTypeEnum.t((value as any) || null) || "";
  const color = colorFor(((value as any) || "TEXT") as any);
  const Comp: any = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon && value ? iconFor(value) : null}
      <span>{label}</span>
    </Comp>
  );
}

export default QuestionTypeBadge;
