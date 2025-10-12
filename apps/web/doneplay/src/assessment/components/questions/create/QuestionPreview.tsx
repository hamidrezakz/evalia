"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { QuestionTypeBadge } from "@/components/status-badges";
import { QuestionText } from "@/app/dashboard/tests/take/components/QuestionText";
import { QuestionBoolean } from "@/app/dashboard/tests/take/components/QuestionBoolean";
import { QuestionSingleChoice } from "@/app/dashboard/tests/take/components/QuestionSingleChoice";
import { QuestionMultiChoice } from "@/app/dashboard/tests/take/components/QuestionMultiChoice";
import { QuestionScale } from "@/app/dashboard/tests/take/components/QuestionScale";

type PreviewOption = { id: any; value: string; label: string };

export interface QuestionPreviewProps {
  title: string;
  type: "TEXT" | "BOOLEAN" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "SCALE";
  options?: PreviewOption[];
  minScale?: number;
  maxScale?: number;
}

export function QuestionPreview({
  title,
  type,
  options = [],
  minScale = 1,
  maxScale = 5,
}: QuestionPreviewProps) {
  const name = "preview";
  function renderBody() {
    switch (type) {
      case "TEXT":
        return (
          <QuestionText
            id={-1}
            value={undefined as any}
            onChange={() => {}}
            onSubmitNext={() => {}}
          />
        );
      case "BOOLEAN":
        return (
          <QuestionBoolean
            name={name}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      case "SINGLE_CHOICE":
        return (
          <QuestionSingleChoice
            name={name}
            options={options}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      case "MULTI_CHOICE":
        return (
          <QuestionMultiChoice
            options={options}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      case "SCALE": {
        const opts = Array.from(
          { length: Math.max(0, (maxScale ?? 5) - (minScale ?? 1) + 1) },
          (_, i) => {
            const n = (minScale ?? 1) + i;
            return { value: String(n), label: String(n) };
          }
        );
        return (
          <QuestionScale
            name={name}
            options={opts}
            value={undefined as any}
            onChange={() => {}}
          />
        );
      }
      default:
        return null;
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium">پیش‌نمایش</Label>
      <div className="rounded-md border p-4 bg-background/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-xs font-medium line-clamp-2 flex-1">{title}</div>
          <QuestionTypeBadge type={type as any} tone="soft" size="xs" />
        </div>
        {renderBody()}
      </div>
    </div>
  );
}

export default QuestionPreview;
