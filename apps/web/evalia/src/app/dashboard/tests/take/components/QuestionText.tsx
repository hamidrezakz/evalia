"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      <Label htmlFor={`q-${id}`}>پاسخ شما</Label>
      <Input
        id={`q-${id}`}
        className="max-w-xl"
        value={text}
        onChange={(e) => onChange({ kind: "TEXT", text: e.target.value })}
        placeholder="بنویسید..."
      />
      <div className="flex justify-start">
        <Button size="sm" variant="secondary" onClick={() => onSubmitNext()}>
          ثبت و رفتن به بعدی
        </Button>
      </div>
    </div>
  );
}
