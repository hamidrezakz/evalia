"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import type { Template } from "@/assessment/types/templates.types";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TemplateComboboxProps {
  items: Template[];
  value: number | null;
  onChange: (tpl: Template | null) => void;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
}

export default function TemplateCombobox({
  items,
  value,
  onChange,
  disabled,
  placeholder = "انتخاب قالب",
  loading,
}: TemplateComboboxProps) {
  const stateLabel: Record<Template["state"], string> = {
    DRAFT: "پیش‌نویس",
    ACTIVE: "فعال",
    CLOSED: "بسته",
    ARCHIVED: "آرشیو",
  } as const;

  function stateVariant(state: Template["state"]) {
    switch (state) {
      case "ACTIVE":
        return "default";
      case "DRAFT":
        return "secondary";
      case "CLOSED":
        return "outline";
      case "ARCHIVED":
        return "outline";
      default:
        return "secondary";
    }
  }

  return (
    <Combobox<Template>
      items={items}
      value={value}
      onChange={(_val, item) => onChange(item || null)}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      getKey={(t) => t.id}
      getLabel={(t) => t.name}
      leadingIcon={FileText as any}
      emptyText="قالبی یافت نشد"
      renderItem={({ item, selected }) => (
        <div className="flex items-center justify-between gap-3 w-full">
          <span className="truncate text-xs font-medium">{item.name}</span>
          <Badge
            variant={stateVariant(item.state)}
            className="text-[9px] py-0 px-2 whitespace-nowrap">
            {stateLabel[item.state]}
          </Badge>
        </div>
      )}
      renderValue={({ item }) => (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[140px] text-xs font-medium">
            {item.name}
          </span>
          <Badge
            variant={stateVariant(item.state)}
            className="text-[9px] py-0 px-1.5">
            {stateLabel[item.state]}
          </Badge>
        </div>
      )}
    />
  );
}
