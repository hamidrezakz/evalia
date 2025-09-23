"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AnswerValue } from "../types";

export function QuestionText({
  id,
  value,
  onChange,
  onSubmitNext,
}: {
  id: number;
  value?: AnswerValue;
  onChange: (v: AnswerValue) => void;
  onSubmitNext: () => void;
}) {
  const text = value?.kind === "TEXT" ? value.text : "";
  return (
    <div className="space-y-2">
      <Label htmlFor={`q-${id}`} className="text-[15px] font-custom">
        پاسخ شما
      </Label>
      <Textarea
        id={`q-${id}`}
        className="max-w-2xl"
        value={text}
        onChange={(e) => onChange({ kind: "TEXT", text: e.target.value })}
        placeholder="بنویسید..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmitNext();
          }
        }}
        onBlur={() => {
          onSubmitNext();
        }}
      />
      {/* Removed explicit next button to reduce visual clutter */}
    </div>
  );
}
