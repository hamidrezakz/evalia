"use client";
import type { Question } from "@/assessment/types/question-banks.types";
import type { AnswerRecord, OptionItem } from "../types";
import { Button } from "@/components/ui/button";
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
}

export function ScaleQuestion({ question, record, options, setValue }: Props) {
  const current = typeof record.value === "number" ? record.value : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">{question.text}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const v = Number(o.value);
          const selected = current === v;
          return (
            <Button
              key={o.value}
              size="sm"
              variant={selected ? "default" : "outline"}
              disabled={record.status === "SUBMITTING"}
              onClick={() => setValue(question, v, "immediate")}
              className={cn(
                selected && "ring-2 ring-offset-1 ring-primary/50"
              )}>
              {o.label}
            </Button>
          );
        })}
      </div>
      {record.status === "ERROR" && (
        <p className="text-xs text-destructive">ذخیره با خطا مواجه شد</p>
      )}
    </div>
  );
}
