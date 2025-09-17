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
    value: string,
    strategy: "immediate" | "debounce"
  ) => void;
}

export function SingleChoiceQuestion({
  question,
  record,
  options,
  setValue,
}: Props) {
  const current = typeof record.value === "string" ? record.value : undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">{question.text}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const selected = current === o.value;
          return (
            <Button
              key={o.value}
              variant={selected ? "default" : "outline"}
              disabled={record.status === "SUBMITTING"}
              onClick={() => setValue(question, o.value, "immediate")}
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
