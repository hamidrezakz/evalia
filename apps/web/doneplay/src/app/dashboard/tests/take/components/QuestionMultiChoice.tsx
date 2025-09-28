"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function QuestionMultiChoice({
  options,
  value,
  readOnly,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value?: AnswerValue;
  readOnly?: boolean;
  onChange: (v: AnswerValue) => void;
}) {
  const values = value?.kind === "MULTI_CHOICE" ? value.values : [];
  function toggle(v: string, checked: boolean) {
    if (readOnly) return;
    const base = values ?? [];
    const next = checked
      ? Array.from(new Set([...base, v]))
      : base.filter((x) => x !== v);
    onChange({ kind: "MULTI_CHOICE", values: next });
  }
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => {
        const checked = values.includes(o.value);
        return (
          <div
            key={o.value}
            className={`inline-flex items-center gap-2 ${
              checked ? "text-primary" : ""
            }`}>
            <Checkbox
              checked={checked}
              onCheckedChange={(val) => toggle(o.value, Boolean(val))}
              id={`mc-${o.value}`}
              disabled={!!readOnly}
            />
            <Label
              htmlFor={`mc-${o.value}`}
              className="text-[15px] font-custom inline-flex items-center gap-1">
              <span className="text-[15px] leading-5">{o.value}</span>
              {o.label && o.label !== o.value ? (
                <span className="text-xs text-muted-foreground">
                  ({o.label})
                </span>
              ) : null}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
