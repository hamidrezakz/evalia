"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function QuestionBoolean({
  name,
  value,
  onChange,
}: {
  name: string;
  value?: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const checkedTrue = value?.kind === "BOOLEAN" && value.value === true;
  const checkedFalse = value?.kind === "BOOLEAN" && value.value === false;
  const current = checkedTrue ? "true" : checkedFalse ? "false" : undefined;
  return (
    <RadioGroup
      value={current}
      onValueChange={(val) => {
        const v = val === "true";
        onChange({ kind: "BOOLEAN", value: v });
      }}
      className="items-start gap-2"
      name={name}>
      <label
        className={`inline-flex items-center gap-2 cursor-pointer ${
          checkedTrue ? "text-primary" : ""
        }`}>
        <RadioGroupItem value="true" id={`${name}-true`} />
        <span>بله</span>
      </label>
      <label
        className={`inline-flex items-center gap-2 cursor-pointer ${
          checkedFalse ? "text-primary" : ""
        }`}>
        <RadioGroupItem value="false" id={`${name}-false`} />
        <span>خیر</span>
      </label>
    </RadioGroup>
  );
}
