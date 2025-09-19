"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { Library, ChevronsUpDownIcon } from "lucide-react";
import { useQuestionBanks } from "../../../api/hooks";

interface QuestionBankComboboxProps {
  value: number | null;
  onChange: (id: number | null, item?: { id: number; name: string }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const QuestionBankCombobox: React.FC<QuestionBankComboboxProps> = ({
  value,
  onChange,
  placeholder = "انتخاب بانک سوال...",
  disabled,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useQuestionBanks({ search });
  const banks = data?.data || [];

  return (
    <Combobox<{ id: number; name: string }>
      items={banks}
      value={value}
      onChange={(val, item) => onChange((val as number) ?? null, item)}
      placeholder={isLoading ? "در حال بارگذاری..." : placeholder}
      disabled={disabled}
      className={className}
      getKey={(b) => b.id}
      getLabel={(b) => b.name}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={Library}
      trailingIcon={ChevronsUpDownIcon}
      loading={isLoading}
      emptyText="موردی یافت نشد"
    />
  );
};
