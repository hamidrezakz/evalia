"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AnswerValue } from "../types";

export function QuestionText({
  id,
  value,
  readOnly,
  onChange,
  onSubmitNext,
}: {
  id: number;
  value?: AnswerValue;
  readOnly?: boolean;
  onChange: (v: AnswerValue) => void;
  onSubmitNext: () => void;
}) {
  const text = value?.kind === "TEXT" ? value.text : "";
  return (
    <div className="space-y-2">
      <Textarea
        id={`q-${id}`}
        className="max-w-2xl placeholder:text-[14px] text-[14px]"
        value={text}
        onChange={(e) =>
          !readOnly && onChange({ kind: "TEXT", text: e.target.value })
        }
        readOnly={!!readOnly}
        disabled={!!readOnly}
        placeholder="بنویسید..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!readOnly) onSubmitNext();
          }
        }}
        onBlur={() => {
          if (!readOnly) onSubmitNext();
        }}
      />
      {/* Removed explicit next button to reduce visual clutter */}
    </div>
  );
}
