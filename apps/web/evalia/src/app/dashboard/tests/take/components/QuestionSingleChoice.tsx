"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function QuestionSingleChoice({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: Array<{ value: string; label: string }>;
  value?: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const current = value?.kind === "SINGLE_CHOICE" ? value.value : "";
  return (
    <RadioGroup
      name={name}
      value={current}
      onValueChange={(val) => {
        onChange({ kind: "SINGLE_CHOICE", value: String(val) });
      }}
      className="items-start gap-2">
      {options.map((o) => {
        const selected = current === o.value;
        return (
          <label
            key={o.value}
            className={`inline-flex items-center gap-2 cursor-pointer ${
              selected ? "text-primary" : ""
            }`}>
            <RadioGroupItem value={o.value} id={`${name}-${o.value}`} />
            <span>{o.label}</span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
