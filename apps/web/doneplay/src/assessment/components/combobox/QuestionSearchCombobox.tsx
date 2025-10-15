"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { ListChecks, SquareCheck } from "lucide-react";
import type { Question } from "@/assessment/types/question-banks.types";
import { useQuestions } from "@/assessment/api/hooks";
import { useOrgState } from "@/organizations/organization/context";

export interface QuestionSearchComboboxProps {
  value: number | null;
  onChange: (id: number | null, item?: Question) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  pageSize?: number;
  bankId?: number | null;
}

export const QuestionSearchCombobox: React.FC<QuestionSearchComboboxProps> = ({
  value,
  onChange,
  placeholder = "انتخاب سوال",
  disabled,
  className,
  pageSize = 50,
  bankId,
}) => {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState(search);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const orgCtx = useOrgState();
  const activeOrgId = orgCtx.activeOrganizationId || null;
  const { data, isLoading } = useQuestions(activeOrgId, {
    search: debounced,
    pageSize,
    bankId: bankId ?? undefined,
  });
  const items: Question[] = (data?.data as Question[]) || [];

  return (
    <Combobox<Question>
      items={items}
      value={value}
      onChange={(val, item) => onChange((val as number) ?? null, item)}
      placeholder={isLoading ? "در حال بارگذاری..." : placeholder}
      disabled={disabled}
      className={className}
      getKey={(q) => q.id}
      getLabel={(q) => q.text}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={ListChecks}
      trailingIcon={SquareCheck}
      loading={isLoading}
      emptyText="موردی یافت نشد"
    />
  );
};

export default QuestionSearchCombobox;
