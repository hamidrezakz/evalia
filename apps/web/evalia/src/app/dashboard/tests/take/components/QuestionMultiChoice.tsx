"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { Checkbox } from "@/components/ui/checkbox";

export function QuestionMultiChoice({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value?: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const values = value?.kind === "MULTI_CHOICE" ? value.values : [];
  function toggle(v: string, checked: boolean) {
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
          <label
            key={o.value}
            className={`inline-flex items-center gap-2 cursor-pointer ${
              checked ? "text-primary" : ""
            }`}>
            <Checkbox
              checked={checked}
              onCheckedChange={(val) => toggle(o.value, Boolean(val))}
              id={`mc-${o.value}`}
            />
            <span className="inline-flex items-center gap-1">
              <span className="text-sm">{o.value}</span>
              {o.label && o.label !== o.value ? (
                <span className="text-xs text-muted-foreground">
                  ({o.label})
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
