"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { composeBadgeClass, type BadgeStyleOptions } from "./styles";
import { CheckCircle2, Clock, CircleDashed } from "lucide-react";

// Possible per-question answer status values
export type QuestionAnswerStatus = "ANSWERED" | "PENDING" | "UNANSWERED";

function colorFor(status: QuestionAnswerStatus): string {
  switch (status) {
    case "ANSWERED":
      return "emerald"; // success
    case "PENDING":
      return "sky"; // waiting / transient
    case "UNANSWERED":
    default:
      return "zinc"; // neutral
  }
}

function iconFor(status: QuestionAnswerStatus) {
  const cls = "h-3 w-3";
  switch (status) {
    case "ANSWERED":
      return <CheckCircle2 className={cls} />;
    case "PENDING":
      return <Clock className={cls} />;
    case "UNANSWERED":
    default:
      return <CircleDashed className={cls} />;
  }
}

function labelFa(status: QuestionAnswerStatus): string {
  switch (status) {
    case "ANSWERED":
      return "پاسخ داده شده";
    case "PENDING":
      return "منتظر ذخیره";
    case "UNANSWERED":
    default:
      return "پاسخ داده نشده";
  }
}

export interface QuestionAnswerStatusBadgeProps extends BadgeStyleOptions {
  status: QuestionAnswerStatus;
  withIcon?: boolean;
  as?: React.ElementType;
}

export function QuestionAnswerStatusBadge({
  status,
  tone = "soft",
  size = "xs",
  withIcon = true,
  className,
  as,
}: QuestionAnswerStatusBadgeProps) {
  const color = colorFor(status);
  const Comp: React.ElementType = as || Badge;
  return (
    <Comp className={composeBadgeClass(color, { tone, size, className })}>
      {withIcon ? iconFor(status) : null}
      <span>{labelFa(status)}</span>
    </Comp>
  );
}

export default QuestionAnswerStatusBadge;
