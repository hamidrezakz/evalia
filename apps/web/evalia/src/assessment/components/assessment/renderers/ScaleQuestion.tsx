"use client";
import type { Question } from "@/assessment/types/question-banks.types";
import type { AnswerRecord, OptionItem } from "../types";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  record: AnswerRecord;
  options: OptionItem[]; // scale points (value numeric string)
  setValue: (
    q: Question,
    value: number,
    strategy: "immediate" | "debounce"
  ) => void;
  hideTitle?: boolean;
}

export function ScaleQuestion({ question, record, options, setValue, hideTitle }: Props) {
  const current = typeof record.value === "number" ? record.value : undefined;

  // Derive min / max from options or question defaults
  const numericOptions = (options || [])
    .map((o) => Number(o.value))
    .filter((n) => !Number.isNaN(n));
  const min = numericOptions.length
    ? Math.min(...numericOptions)
    : typeof question.minScale === "number"
    ? question.minScale
    : 1;
  const max = numericOptions.length
    ? Math.max(...numericOptions)
    : typeof question.maxScale === "number"
    ? question.maxScale
    : 5;
  const disabled = record.status === "SUBMITTING";
  const valueArr = [
    typeof current === "number" ? current : Math.round((min + max) / 2),
  ];

  return (
    <div className="flex flex-col gap-3">
      {!hideTitle && <div className="text-sm font-medium">{question.text}</div>}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "text-xs px-2 py-1 rounded-md border",
            "min-w-8 text-center"
          )}>
          {valueArr[0]}
        </div>
        <div className="text-xs text-muted-foreground w-8 text-center">
          {min}
        </div>
        <Slider
          dir="rtl"
          min={min}
          max={max}
          value={valueArr as number[]}
          disabled={disabled}
          onValueChange={([val]) =>
            typeof val === "number" && setValue(question, val, "debounce")
          }
          onValueCommit={([val]) =>
            typeof val === "number" && setValue(question, val, "immediate")
          }
          aria-label="scale"
          className="flex-1"
        />
        <div className="text-xs text-muted-foreground w-8 text-center">
          {max}
        </div>
      </div>
      {record.status === "ERROR" && (
        <p className="text-xs text-destructive">ذخیره با خطا مواجه شد</p>
      )}
    </div>
  );
}
