"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { HelpCircle, ChevronsUpDownIcon } from "lucide-react";
import { QuestionTypeEnum } from "@/lib/enums";

interface QuestionTypeComboboxProps {
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const QuestionTypeCombobox: React.FC<QuestionTypeComboboxProps> = ({
  value,
  onChange,
  placeholder = "نوع سوال...",
  disabled,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  const all = QuestionTypeEnum.options();
  const items = React.useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? all.filter(
          (o: any) =>
            String(o.label).toLowerCase().includes(q) ||
            String(o.rawLabel || "")
              .toLowerCase()
              .includes(q)
        )
      : all;
  }, [all, search]);

  return (
    <Combobox<{ value: string; label: string; rawLabel?: string }>
      items={items as any}
      value={value}
      onChange={(val) => onChange((val as string) ?? null)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      getKey={(o) => o.value}
      getLabel={(o) => o.label}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={HelpCircle}
      trailingIcon={ChevronsUpDownIcon}
      emptyText="موردی یافت نشد"
    />
  );
};
