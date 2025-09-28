"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { ListChecks, ChevronsUpDownIcon } from "lucide-react";
import { useOptionSets } from "../../../api/hooks";

interface OptionSetComboboxProps {
  value: number | null;
  onChange: (id: number | null, item?: { id: number; name: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const OptionSetCombobox: React.FC<OptionSetComboboxProps> = ({
  value,
  onChange,
  placeholder = "انتخاب دسته گزینه‌ها...",
  disabled,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useOptionSets({ search });
  const sets = data?.data || [];

  return (
    <Combobox<{ id: number; name: string }>
      items={sets}
      value={value}
      onChange={(val, item) => onChange((val as number) ?? null, item)}
      placeholder={isLoading ? "در حال بارگذاری..." : placeholder}
      disabled={disabled}
      className={className}
      getKey={(s) => s.id}
      getLabel={(s) => s.name}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={ListChecks}
      trailingIcon={ChevronsUpDownIcon}
      loading={isLoading}
      emptyText="موردی یافت نشد"
    />
  );
};
