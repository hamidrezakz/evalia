"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function QuestionScale({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Array<{ value: string; label: string }>;
  value?: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const numericValues = React.useMemo(() => {
    const nums = options
      .map((o) => Number(o.value))
      .filter((n) => !Number.isNaN(n));
    // Ensure we have at least a [1..5] fallback if options are empty or invalid
    return nums.length ? nums : [1, 2, 3, 4, 5];
  }, [options]);

  const min = React.useMemo(() => Math.min(...numericValues), [numericValues]);
  const max = React.useMemo(() => Math.max(...numericValues), [numericValues]);

  const currentNum =
    value?.kind === "SCALE" && typeof value.value === "number"
      ? value.value
      : min;

  const snapToOption = React.useCallback(
    (n: number) => {
      let closest = numericValues[0];
      let diff = Math.abs(numericValues[0] - n);
      for (const v of numericValues) {
        const d = Math.abs(v - n);
        if (d < diff) {
          diff = d;
          closest = v;
        }
      }
      return closest;
    },
    [numericValues]
  );

  return (
    <div className="w-full max-w-xl">
      <Label htmlFor={name} className="mb-2 inline-block">
        انتخاب مقدار
      </Label>
      <div className="py-2">
        <Slider
          min={min}
          max={max}
          step={1}
          value={[Number(currentNum)]}
          onValueChange={(vals) => {
            const n = snapToOption(vals[0] ?? min);
            onChange({ kind: "SCALE", value: Number(n) });
          }}
          aria-label="scale"
        />
      </div>
      {/* Ticks / labels */}
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {options && options.length
          ? options.map((o) => (
              <span key={o.value} className="min-w-0">
                {o.label}
              </span>
            ))
          : [min, max].map((n) => <span key={n}>{n}</span>)}
      </div>
    </div>
  );
}
