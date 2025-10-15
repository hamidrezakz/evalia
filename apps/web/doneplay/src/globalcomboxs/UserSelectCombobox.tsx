"use client";
import * as React from "react";
import { Combobox, ComboboxKey } from "@/components/ui/combobox";
import { useUsers } from "@/users/api/users-hooks";
import type { UserListItem, ListUsersQuery } from "@/users/types/users.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatIranPhone } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { normalizeIranPhoneFragment } from "@/lib/phone-normalize";

/**
 * Centralized user selection combobox.
 * Features:
 * - Remote search across name/email/phone (backend supports phone partial).
 * - Optional filtering by orgId, statuses, platformRoles, teamName, etc.
 * - Debounced input (300ms) to avoid excessive network hits.
 * - Avatar + name/email + phone in each row.
 * - Reusable across dashboard modules (assessments, organizations, teams, etc.).
 */
export interface UserSelectComboboxProps {
  value: number | null;
  onChange: (userId: number | null, user?: UserListItem) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Filter by organization membership */
  orgId?: number;
  /** Filter by team name (substring) */
  teamName?: string;
  /** Filter by platform/global roles */
  platformRoles?: string[];
  /** Filter by status set */
  statuses?: string[];
  /** Additional raw query overrides */
  extraQuery?: Partial<ListUsersQuery>;
  /** Page size for fetching */
  pageSize?: number;
  /** CSS class */
  className?: string;
}

const DEBOUNCE = 300;

export function UserSelectCombobox(props: UserSelectComboboxProps) {
  const {
    value,
    onChange,
    placeholder = "انتخاب کاربر...",
    disabled,
    orgId,
    teamName,
    platformRoles,
    statuses,
    extraQuery,
    pageSize = 20,
    className,
  } = props;

  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  // Debounce search term
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), DEBOUNCE);
    return () => clearTimeout(t);
  }, [search]);

  const query: Partial<ListUsersQuery> = React.useMemo(() => {
    let qVal: string | undefined = debounced || undefined;
    if (debounced) {
      const digitish = debounced.replace(/[^0-9+]/g, "");
      if (digitish.length >= 2) {
        const norm = normalizeIranPhoneFragment(debounced);
        // Use normalized primary if it differs; this boosts match for '09', '9', '930'
        if (norm.primary) qVal = norm.primary;
      }
    }
    const q: Partial<ListUsersQuery> = {
      page: 1,
      pageSize,
      q: qVal,
      orgId: orgId ? Number(orgId) : undefined,
      teamName: teamName || undefined,
      platformRoles:
        platformRoles && platformRoles.length ? platformRoles : undefined,
      statuses: statuses && statuses.length ? statuses : undefined,
      ...(extraQuery || {}),
    };
    return q;
  }, [
    debounced,
    orgId,
    teamName,
    platformRoles,
    statuses,
    extraQuery,
    pageSize,
  ]);

  const { data, isLoading, isFetching } = useUsers(query);
  const items: UserListItem[] = data?.data || [];

  const getLabel = React.useCallback((u: UserListItem) => {
    return u.fullName || u.email || u.phone || `#${u.id}`;
  }, []);

  const getKey = React.useCallback((u: UserListItem) => u.id, []);

  // Compose combobox items but enrich with custom rendering via overriding filter + label (we handle search server side mostly)
  return (
    <div className={cn("relative", className)}>
      <Combobox<UserListItem>
        items={items}
        value={value}
        onChange={(val, item) => onChange(val as number | null, item)}
        placeholder={placeholder}
        disabled={disabled}
        searchable
        searchValue={search}
        onSearchChange={setSearch}
        getKey={getKey as any}
        getLabel={getLabel as any}
        loading={isLoading || isFetching}
        filter={(item) => {
          if (!debounced) return true;
          const raw = debounced.toLowerCase();
          const phoneNorm = (item.phone || "").toLowerCase(); // stored as +98...
          const hay = `${item.fullName || ""} ${item.email || ""} ${
            item.phone || ""
          }`.toLowerCase();
          if (hay.includes(raw)) return true;
          // If user typed 0xxxx but stored is +98xxxx -> map 0 + rest to +98 + rest
          if (raw.startsWith("0") && raw.length >= 2) {
            const alt = "+98" + raw.substring(1);
            if (phoneNorm.includes(alt)) return true;
          }
          // If user typed without 0 (e.g. 9305...) also try +98 + raw
          if (/^[0-9]{2,}$/.test(raw)) {
            const alt2 = "+98" + raw;
            if (phoneNorm.includes(alt2)) return true;
          }
          return false;
        }}
        className="text-right"
        leadingIcon={undefined}
        trailingIcon={undefined}
        renderItem={({ item }) => <UserRow user={item} />}
        renderValue={({ item }) => (
          <span className="flex items-center gap-2 min-w-0">
            <UserAvatarSmall user={item} />
            <span className="truncate text-[12px] font-medium">
              {item.fullName || item.email || `کاربر #${item.id}`}
            </span>
          </span>
        )}
      />
      {(isLoading || isFetching) && (
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        </span>
      )}
      {/* Custom item rendering via global CSS hook: override command list items */}
      <style jsx global>{`
        /* Enhance user combobox items with avatar + phone */
        [role="listbox"] > div > div > div > div[data-user-item] {
          /* overly specific but safe */
        }
      `}</style>
    </div>
  );
}

// New extracted avatar component (small size for selected value)
function UserAvatarSmall({ user }: { user: UserListItem }) {
  const { src } = useAvatarImage(user.avatarUrl || user.avatar || null);
  const initials = React.useMemo(
    () =>
      (user.fullName || user.email || "?")
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("") || "?",
    [user.fullName, user.email]
  );
  return (
    <Avatar className="h-5 w-5">
      <AvatarImage
        src={src || undefined}
        alt={user.fullName || user.email || String(user.id)}
      />
      <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
    </Avatar>
  );
}

/** Lightweight row component (optional future extraction) */
function UserRow({ user }: { user: UserListItem }) {
  const { src } = useAvatarImage(user.avatarUrl || user.avatar || null);
  const initials = React.useMemo(
    () =>
      (user.fullName || user.email || "?")
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("") || "?",
    [user.fullName, user.email]
  );
  return (
    <div className="flex items-center gap-2 min-w-0" data-user-item>
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={src || undefined}
          alt={user.fullName || user.email || String(user.id)}
        />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-[12px] font-medium truncate">
          {user.fullName || user.email || `کاربر #${user.id}`}
        </span>
        {(user.phone || user.email) && (
          <span className="text-[10px] text-muted-foreground truncate">
            {user.phone ? formatIranPhone(user.phone) : user.email}
          </span>
        )}
      </div>
    </div>
  );
}

export default UserSelectCombobox;
