"use client";
import { useEffect, useState } from "react";
import type { Question } from "@/assessment/types/question-banks.types";
import type { AnswerRecord } from "../types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Props {
  question: Question;
  record: AnswerRecord;
  setValue: (
    q: Question,
    value: string,
    strategy: "debounce" | "immediate"
  ) => void;
  autoFocus?: boolean;
  hideTitle?: boolean;
}

export function TextQuestion({ question, record, setValue, autoFocus, hideTitle }: Props) {
  const [val, setVal] = useState(
    record.status === "UNANSWERED" ? "" : (record.value as string) ?? ""
  );

  // If an answered value arrives later (loaded asynchronously) and local still untouched, sync it
  useEffect(() => {
    if (record.status === "ANSWERED" && val === "" && record.value) {
      setVal(record.value as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.status, record.value]);

  return (
    <div className="flex flex-col gap-2">
      {!hideTitle && <label className="font-medium text-sm">{question.text}</label>}
      <Input
        autoFocus={autoFocus}
        value={val}
        disabled={record.status === "SUBMITTING"}
        onChange={(e) => {
          const newVal = e.target.value;
          setVal(newVal);
          setValue(question, newVal, "debounce");
        }}
        className={cn(
          record.status === "ERROR" &&
            "border-destructive focus-visible:ring-destructive"
        )}
        placeholder="پاسخ شما..."
      />
      {record.status === "ERROR" && (
        <p className="text-xs text-destructive">
          خطا در ذخیره پاسخ. تلاش دوباره در حال انجام است...
        </p>
      )}
    </div>
  );
}
