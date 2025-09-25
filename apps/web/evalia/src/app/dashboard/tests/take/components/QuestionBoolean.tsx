"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function QuestionBoolean({
  name,
  value,
  readOnly,
  onChange,
}: {
  name: string;
  value?: AnswerValue;
  readOnly?: boolean;
  onChange: (v: AnswerValue) => void;
}) {
  const checkedTrue = value?.kind === "BOOLEAN" && value.value === true;
  const checkedFalse = value?.kind === "BOOLEAN" && value.value === false;
  const current = checkedTrue ? "true" : checkedFalse ? "false" : undefined;
  return (
    <RadioGroup
      value={current}
      onValueChange={(val) => {
        if (readOnly) return;
        const v = val === "true";
        onChange({ kind: "BOOLEAN", value: v });
      }}
      className="items-start gap-2"
      name={name}>
      <div
        className={`inline-flex items-center gap-2 ${
          checkedTrue ? "text-primary" : ""
        }`}>
        <RadioGroupItem
          value="true"
          id={`${name}-true`}
          disabled={!!readOnly}
        />
        <Label htmlFor={`${name}-true`} className="text-[15px] font-custom">
          بله
        </Label>
      </div>
      <div
        className={`inline-flex items-center gap-2 ${
          checkedFalse ? "text-primary" : ""
        }`}>
        <RadioGroupItem
          value="false"
          id={`${name}-false`}
          disabled={!!readOnly}
        />
        <Label htmlFor={`${name}-false`} className="text-[15px] font-custom">
          خیر
        </Label>
      </div>
    </RadioGroup>
  );
}
