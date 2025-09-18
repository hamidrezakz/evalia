"use client";
import type { Question } from "@/assessment/types/question-banks.types";
import type { AnswerRecord, OptionItem } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  hideTitle?: boolean;
}

export function SingleChoiceQuestion({
  question,
  record,
  options,
  setValue,
  hideTitle,
}: Props) {
  const current = typeof record.value === "string" ? record.value : undefined;
  return (
    <div className="flex flex-col gap-3">
      {!hideTitle && <div className="text-sm font-medium">{question.text}</div>}
      <RadioGroup
        value={current}
        onValueChange={(val) => setValue(question, val, "immediate")}
        className="gap-2">
        {options.map((o, idx) => {
          const id = `q-${question.id}-opt-${idx}`;
          const selected = current === o.value;
          return (
            <div
              key={o.value}
              className={cn(
                "flex items-center gap-3 rounded-md border p-2 justify-start",
                selected ? "border-primary/50 bg-primary/5" : "border-border"
              )}
              data-disabled={record.status === "SUBMITTING"}>
              <RadioGroupItem
                id={id}
                value={o.value}
                disabled={record.status === "SUBMITTING"}
              />
              <Label htmlFor={id} className="flex-1 cursor-pointer">
                {o.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      {record.status === "ERROR" && (
        <p className="text-xs text-destructive">ذخیره با خطا مواجه شد</p>
      )}
    </div>
  );
}
