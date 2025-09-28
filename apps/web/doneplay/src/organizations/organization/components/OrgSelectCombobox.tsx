"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { useOrganizations } from "@/organizations/organization/api/organization-hooks";
import { Organization } from "@/organizations/organization/types/organization.types";
import { Building2 } from "lucide-react";
import {
  OrganizationStatusBadge,
  OrgPlanBadge,
} from "@/components/status-badges";
import { cn } from "@/lib/utils";

/**
 * Centralized Organization selector.
 * Features:
 * - Remote debounced search (q) on name / slug (backend side handles filtering with `q`).
 * - Single source of truth to replace ad-hoc organization combobox usages.
 * - Supports extra query params via `extraParams` (plan/status/orderBy ...)
 * - Ready for extension: could add renderItem for richer rows (plan/status badges) later.
 *
 * Example:
 * <OrgSelectCombobox
 *   value={orgId}
 *   onChange={(id, org) => setOrgId(id)}
 *   extraParams={{ plan: 'PRO' }}
 * />
 */
export interface OrgSelectComboboxProps {
  value: number | null;
  onChange: (orgId: number | null, org?: Organization) => void;
  placeholder?: string;
  disabled?: boolean;
  pageSize?: number;
  className?: string;
  /** Extra raw params passed to useOrganizations (e.g., { plan: 'PRO' }) */
  extraParams?: Partial<Record<string, unknown>>;
}

const DEBOUNCE = 300;

export function OrgSelectCombobox({
  value,
  onChange,
  placeholder = "انتخاب سازمان",
  disabled,
  pageSize = 50,
  className,
  extraParams,
}: OrgSelectComboboxProps) {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), DEBOUNCE);
    return () => clearTimeout(t);
  }, [search]);

  const params = React.useMemo(() => {
    const p: Record<string, unknown> = { pageSize };
    if (debounced) p.q = debounced; // backend expects q
    if (extraParams) Object.assign(p, extraParams);
    return p;
  }, [debounced, pageSize, extraParams]);

  const { data, isLoading } = useOrganizations(params);
  const items: Organization[] = React.useMemo(() => {
    if (!data) return [];
    const arr = (data as any).data || data; // support envelope or direct array
    return Array.isArray(arr) ? (arr as Organization[]) : [];
  }, [data]);

  return (
    <Combobox<Organization>
      items={items}
      value={value}
      onChange={(val, item) => onChange((val as number) ?? null, item)}
      placeholder={isLoading ? "در حال بارگذاری..." : placeholder}
      disabled={disabled}
      className={cn("min-w-[240px] w-full", className)}
      getKey={(o) => o.id}
      getLabel={(o) => o.name}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={Building2}
      loading={isLoading}
      emptyText={debounced ? "یافت نشد" : "سازمانی وجود ندارد"}
      filter={(o, q) => {
        // client fallback filter (case-insensitive)
        const hay = `${o.name}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }}
    />
  );
}

export default OrgSelectCombobox;
