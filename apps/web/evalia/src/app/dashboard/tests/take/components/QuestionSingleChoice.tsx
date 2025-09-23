"use client";
import React from "react";
import type { AnswerValue } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
          <div
            key={o.value}
            className={`inline-flex items-center gap-2 cursor-pointer ${
              selected ? "text-primary" : ""
            }`}>
            <RadioGroupItem value={o.value} id={`${name}-${o.value}`} />
            <Label
              htmlFor={`${name}-${o.value}`}
              className="cursor-pointer text-[15px] font-custom inline-flex items-center gap-1">
              <span className="text-[15px] leading-5">{o.value}</span>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
