"use client";
import * as React from "react";
import { Combobox } from "@/components/ui/combobox";
import { useTeams } from "@/organizations/team/api/team-hooks";
import { UsersRound } from "lucide-react";
import type { Team } from "@/organizations/team/types/team.types";
import { cn } from "@/lib/utils";

/**
 * Centralized Team selector.
 * Features:
 * - Requires orgId (scoped teams).
 * - Debounced remote search (name contains) -> backend listTeams(q) supports filter.
 * - Graceful disabled state until org chosen.
 * - Extensible via extraParams (includeDeleted, etc.).
 *
 * Example:
 * <TeamSelectCombobox
 *   orgId={selectedOrgId}
 *   value={teamId}
 *   onChange={(id, team) => setTeamId(id)}
 * />
 */
export interface TeamSelectComboboxProps {
  orgId: number | null;
  value: number | null;
  onChange: (teamId: number | null, team?: Team) => void;
  placeholder?: string;
  disabled?: boolean;
  pageSize?: number;
  className?: string;
  /** Optional extra params (includeDeleted, etc.) */
  extraParams?: {
    includeDeleted?: boolean;
    q?: string; // will be overridden by internal search
  };
}

const DEBOUNCE = 300;

export function TeamSelectCombobox({
  orgId,
  value,
  onChange,
  placeholder = "انتخاب تیم",
  disabled,
  pageSize = 50,
  className,
  extraParams,
}: TeamSelectComboboxProps) {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), DEBOUNCE);
    return () => clearTimeout(t);
  }, [search]);

  const params = React.useMemo(() => {
    const p: any = {
      page: 1,
      pageSize,
      ...(extraParams || {}),
    };
    if (debounced) p.q = debounced;
    return p;
  }, [debounced, pageSize, extraParams]);

  const { data, isLoading } = useTeams(orgId || 0, orgId ? params : undefined);
  const items: Team[] = React.useMemo(() => {
    if (!orgId || !data) return [];
    const arr = (data as any).data || data;
    return Array.isArray(arr) ? (arr as Team[]) : [];
  }, [data, orgId]);

  return (
    <Combobox<Team>
      items={items}
      value={value}
      onChange={(val, item) => onChange((val as number) ?? null, item)}
      placeholder={
        orgId
          ? isLoading
            ? "در حال بارگذاری..."
            : placeholder
          : "ابتدا سازمان"
      }
      disabled={disabled || !orgId}
      className={cn("min-w-[240px] w-full", className)}
      getKey={(t) => t.id}
      getLabel={(t) => t.name}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      leadingIcon={UsersRound}
      loading={isLoading}
      emptyText={
        debounced ? "یافت نشد" : orgId ? "تیمی وجود ندارد" : "بدون سازمان"
      }
      filter={(t, q) => t.name.toLowerCase().includes(q.toLowerCase())}
    />
  );
}

export default TeamSelectCombobox;
