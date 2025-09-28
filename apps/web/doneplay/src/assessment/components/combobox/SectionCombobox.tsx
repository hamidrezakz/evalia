"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { Layers, SquareCheck } from "lucide-react";
import type { TemplateSection } from "@/assessment/types/templates.types";

export interface SectionComboboxProps {
  items: TemplateSection[];
  value: number | null;
  onChange: (id: number | null, item?: TemplateSection) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SectionCombobox: React.FC<SectionComboboxProps> = ({
  items,
  value,
  onChange,
  placeholder = "انتخاب سکشن",
  disabled,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  return (
    <Combobox<TemplateSection>
      items={items}
      value={value}
      onChange={(val, item) => onChange((val as number) ?? null, item)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      getKey={(s) => s.id}
      getLabel={(s) => s.title}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={Layers}
      trailingIcon={SquareCheck}
    />
  );
};

export default SectionCombobox;
