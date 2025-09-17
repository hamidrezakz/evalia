"use client";
import type { Question } from "@/assessment/types/question-banks.types";
import type { AnswerRecord, OptionItem } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  question: Question;
  record: AnswerRecord;
  options: OptionItem[];
  setValue: (
    q: Question,
    value: string[],
    strategy: "immediate" | "debounce"
  ) => void;
}

export function MultiChoiceQuestion({
  question,
  record,
  options,
  setValue,
}: Props) {
  const current = Array.isArray(record.value) ? (record.value as string[]) : [];
  const toggle = (val: string) => {
    let next: string[];
    if (current.includes(val)) next = current.filter((v) => v !== val);
    else next = [...current, val];
    setValue(question, next, "immediate");
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">{question.text}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const selected = current.includes(o.value);
          return (
            <Button
              key={o.value}
              variant={selected ? "default" : "outline"}
              disabled={record.status === "SUBMITTING"}
              onClick={() => toggle(o.value)}
              className={cn(
                "justify-start",
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
