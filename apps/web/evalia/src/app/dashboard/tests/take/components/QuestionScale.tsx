"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function QuestionScale({
  name,
  options,
  value,
  readOnly,
  onChange,
  onCommit,
  commitDelayMs = 1000,
}: {
  name: string;
  options: Array<{ value: string; label: string }>;
  value?: AnswerValue;
  readOnly?: boolean;
  onChange: (v: AnswerValue) => void;
  onCommit?: (v: AnswerValue) => void;
  commitDelayMs?: number;
}) {
  const numericValues = React.useMemo(() => {
    const nums = options
      .map((o) => Number(o.value))
      .filter((n) => !Number.isNaN(n));
    // If options are empty or invalid, do not force a hardcoded [1..5] here;
    // we expect caller to pass proper inferred options. As a guard, fallback to [1..5].
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

  // Compute adaptive, nicely-spaced tick labels to avoid overlap on large ranges
  const ticks = React.useMemo(() => {
    const desired = 7; // max number of labels to display
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
      return [min];
    }
    // If the provided numericValues are short, show them all
    if (numericValues.length && numericValues.length <= desired) {
      return Array.from(new Set(numericValues)).sort((a, b) => a - b);
    }

    const span = max - min;
    const rawStep = span / (desired - 1);
    const niceNumber = (x: number) => {
      const exp = Math.floor(Math.log10(x));
      const f = x / Math.pow(10, exp);
      let nf: number;
      if (f < 1.5) nf = 1;
      else if (f < 3) nf = 2;
      else if (f < 7) nf = 5;
      else nf = 10;
      return nf * Math.pow(10, exp);
    };
    let step = niceNumber(rawStep);
    // Build tick list aligned to step, always include min/max
    const first = Math.ceil(min / step) * step;
    const res: number[] = [];
    res.push(min);
    for (let v = first; v < max; v += step) {
      // Avoid duplicates if equal to min due to rounding
      if (v > min && v < max) res.push(Math.round(v));
    }
    res.push(max);
    // If too many, increase step and recompute (guard loop)
    let guard = 0;
    while (res.length > desired && guard < 5) {
      step = niceNumber(step * 1.1);
      const next: number[] = [min];
      const first2 = Math.ceil(min / step) * step;
      for (let v = first2; v < max; v += step) {
        if (v > min && v < max) next.push(Math.round(v));
      }
      next.push(max);
      res.splice(0, res.length, ...next);
      guard++;
    }
    // Ensure uniqueness and sort
    return Array.from(new Set(res)).sort((a, b) => a - b);
  }, [min, max, numericValues]);

  // Debounce ref for commit callback
  const commitRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    return () => {
      if (commitRef.current) {
        clearTimeout(commitRef.current);
        commitRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full max-w-xl">
      <Label
        htmlFor={name}
        className="cursor-pointer text-[15px] font-custom inline-flex items-center gap-1">
        انتخاب مقدار
        <span className="text-xs text-muted-foreground">({currentNum})</span>
      </Label>
      <div className="py-2">
        {/* Debounced commit after user stops changing for commitDelayMs */}
        {/* We implement the debounce locally to standardize UX across input methods */}
        {null}
        <Slider
          min={min}
          max={max}
          step={1}
          value={[Number(currentNum)]}
          onValueChange={(vals) => {
            if (readOnly) return;
            const n = snapToOption(vals[0] ?? min);
            const v = { kind: "SCALE", value: Number(n) } as AnswerValue;
            onChange(v);
            // debounce commit
            if (onCommit) {
              commitRef.current && clearTimeout(commitRef.current);
              commitRef.current = setTimeout(() => {
                onCommit(v);
              }, commitDelayMs);
            }
          }}
          aria-label="scale"
          disabled={!!readOnly}
        />
      </div>
      {/* Ticks / labels: adaptive, positioned under the slider */}
      <div className="mt-2 relative h-6 select-none">
        {/* optional thin tick lines */}
        {ticks.map((t) => {
          const pct = ((t - min) / (max - min)) * 100;
          const rtlPct = 100 - pct;
          return (
            <div
              key={`tick-${t}`}
              className="absolute top-0 h-2 w-px bg-border"
              style={{ left: `${rtlPct}%`, transform: "translateX(-50%)" }}
            />
          );
        })}
        {ticks.map((t) => {
          const pct = ((t - min) / (max - min)) * 100;
          const rtlPct = 100 - pct;
          return (
            <span
              key={`label-${t}`}
              className="absolute top-2 -translate-x-1/2 text-[11px] text-muted-foreground"
              style={{ left: `${rtlPct}%` }}>
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}
