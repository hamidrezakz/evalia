"use client";
import type { Question } from "@/assessment/types/question-banks.types";
import type { AnswerRecord, OptionItem } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  hideTitle?: boolean;
}

export function MultiChoiceQuestion({
  question,
  record,
  options,
  setValue,
  hideTitle,
}: Props) {
  const current = Array.isArray(record.value) ? (record.value as string[]) : [];
  const toggle = (val: string) => {
    let next: string[];
    if (current.includes(val)) next = current.filter((v) => v !== val);
    else next = [...current, val];
    setValue(question, next, "immediate");
  };
  return (
    <div className="flex flex-col gap-3">
      {!hideTitle && <div className="text-sm font-medium">{question.text}</div>}
      <div className="flex flex-col gap-2">
        {options.map((o, idx) => {
          const id = `q-${question.id}-opt-${idx}`;
          const selected = current.includes(o.value);
          return (
            <div
              key={o.value}
              className={cn(
                "flex items-center gap-3 rounded-md border p-2",
                selected ? "border-primary/50 bg-primary/5" : "border-border"
              )}>
              <Checkbox
                id={id}
                checked={selected}
                onCheckedChange={() => toggle(o.value)}
                disabled={record.status === "SUBMITTING"}
              />
              <Label htmlFor={id} className="flex-1 cursor-pointer">
                {o.label}
              </Label>
            </div>
          );
        })}
      </div>
      {record.status === "ERROR" && (
        <p className="text-xs text-destructive">ذخیره با خطا مواجه شد</p>
      )}
    </div>
  );
}
