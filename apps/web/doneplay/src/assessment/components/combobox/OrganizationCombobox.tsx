"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { Building2, SquareCheck } from "lucide-react";
import { useOrganizations } from "@/organizations/organization/api/organization-hooks";

export interface OrganizationComboboxProps {
  value: number | null;
  onChange: (id: number | null, item?: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  pageSize?: number;
}

export const OrganizationCombobox: React.FC<OrganizationComboboxProps> = ({
  value,
  onChange,
  placeholder = "انتخاب سازمان",
  disabled,
  className,
  pageSize = 50,
}) => {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState(search);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = React.useMemo(() => {
    const p: any = { pageSize };
    const q = debounced.trim();
    if (q) p.search = q;
    return p;
  }, [debounced, pageSize]);
  const { data, isLoading } = useOrganizations(params);
  const items: any[] = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as any[];
    const maybe = (data as any).data;
    return Array.isArray(maybe) ? maybe : [];
  }, [data]);

  return (
    <Combobox<any>
      items={items}
      value={value}
      onChange={(val, item) => onChange((val as number) ?? null, item)}
      placeholder={isLoading ? "در حال بارگذاری..." : placeholder}
      disabled={disabled}
      className={className || "min-w-[220px] w-full sm:w-[260px]"}
      getKey={(o) => o.id}
      getLabel={(o) => o.name}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={Building2}
      trailingIcon={SquareCheck}
      loading={isLoading}
      emptyText="سازمانی یافت نشد"
    />
  );
};

export default OrganizationCombobox;
