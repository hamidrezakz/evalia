"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import {
  useOrganizations,
  useParentOrganizations,
} from "@/organizations/organization/api/organization-hooks";
import { Organization } from "@/organizations/organization/types/organization.types";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarImage } from "@/users/api/useAvatarImage";

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
  /** Show avatar/logo for each organization item (default true) */
  showAvatar?: boolean;
  /** Map an organization to its avatar URL (default uses org.avatarUrl) */
  getAvatarUrl?: (org: Organization) => string | null | undefined;
  /** When true, fetches only parent organizations and does NOT call useOrganizations */
  parentsOnly?: boolean;
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
  showAvatar = true,
  getAvatarUrl,
  parentsOnly = false,
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

  // Conditionally fetch either all organizations or only parent organizations (never both)
  const { data: allData, isLoading: isLoadingAll } = useOrganizations(params, {
    enabled: !parentsOnly,
  });
  const { data: parentsData, isLoading: isLoadingParents } =
    useParentOrganizations(params, { enabled: !!parentsOnly });
  const data = parentsOnly ? parentsData : allData;
  const isLoading = parentsOnly ? isLoadingParents : isLoadingAll;
  const items: Organization[] = React.useMemo(() => {
    if (!data) return [];
    const arr = (data as any).data || data; // support envelope or direct array
    return Array.isArray(arr) ? (arr as Organization[]) : [];
  }, [data]);

  // Small presentational row to render org with avatar
  const OrgRow: React.FC<{ org: Organization }> = ({ org }) => {
    const raw =
      (getAvatarUrl ? getAvatarUrl(org) : (org as any).avatarUrl) || null;
    const { src } = useAvatarImage(raw);
    const initials = (org.name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
    return (
      <span className="flex items-center gap-2 min-w-0">
        <Avatar className="h-6 w-6 rounded-md border">
          {src ? <AvatarImage src={src} alt={org.name} /> : null}
          <AvatarFallback className="rounded-md text-[10px]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="truncate">{org.name}</span>
      </span>
    );
  };

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
      leadingIcon={showAvatar ? undefined : Building2}
      loading={isLoading}
      emptyText={debounced ? "یافت نشد" : "سازمانی وجود ندارد"}
      filter={(o, q) => {
        // client fallback filter (case-insensitive)
        const hay = `${o.name}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }}
      renderItem={showAvatar ? ({ item }) => <OrgRow org={item} /> : undefined}
      renderValue={
        showAvatar && value != null
          ? ({ item }) => <OrgRow org={item} />
          : undefined
      }
    />
  );
}

export default OrgSelectCombobox;
