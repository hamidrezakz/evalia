"use client";
import * as React from "react";
import { cn, formatIranPhone } from "@/lib/utils";
import { useOrganization } from "../../api/organization-hooks";
import {
  useUpdateOrganizationMemberRoles,
  useRemoveOrganizationMember,
  useOrganizationMembers,
} from "@/organizations/member/api/organization-membership-hooks";
import { OrgRoleEnum } from "@/lib/enums";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Users2,
  UsersRound,
  PlusCircle,
  ChevronDown,
} from "lucide-react";
import AddMemberDialog from "../add-member-dialog";
import { useUser } from "@/users/api/users-hooks";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OrgRoleBadge } from "@/components/status-badges";
import { toast } from "sonner";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { useUsersByIds } from "@/users/api/users-hooks";

interface MembersDropdownProps {
  orgId: number;
  count?: number;
}

interface MemberRowProps {
  orgId: number;
  membership: { membershipId: number; userId: number; roles?: string[] };
}

// --- Simple helpers ---
function toStringArray(maybe: any): string[] {
  if (!maybe) return [];
  if (Array.isArray(maybe)) {
    // arrays of strings
    if (maybe.every((x) => typeof x === "string")) return maybe as string[];
    // arrays of objects with role/value
    if (maybe.every((x) => x && typeof x === "object")) {
      return maybe
        .map((x) => (typeof x.role === "string" ? x.role : x.value))
        .filter((v: any): v is string => typeof v === "string");
    }
  }
  if (typeof maybe === "object" && Array.isArray((maybe as any).roles)) {
    return toStringArray((maybe as any).roles);
  }
  if (typeof maybe === "string") {
    return maybe.includes(",") ? maybe.split(",") : [maybe];
  }
  return [];
}
function normalize(values: any): string[] {
  return toStringArray(values)
    .map((r) => r.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);
}

function MemberRow({ orgId, membership }: MemberRowProps) {
  const { userId, membershipId } = membership;
  const { data, isLoading } = useUser(userId);
  const fullName = data?.fullName || data?.email || `#${userId}`;
  const phone = (data as any)?.phone as string | undefined;
  const initials = (fullName || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const roleOptions = React.useMemo(() => OrgRoleEnum.options(), []);
  const { src: avatarUrl } = useAvatarImage(
    (data as any)?.avatarUrl || (data as any)?.avatar
  );
  const userOrgRoles = React.useMemo(() => {
    if (!data) return [] as string[];
    const entry = (data as any).organizations?.find(
      (o: any) => o?.orgId === orgId
    );
    if (!entry) return [] as string[];
    const raw = normalize(entry.roles);
    if (!raw.length) return [] as string[];
    return raw
      .map((r) => {
        const match = roleOptions.find(
          (o) => String(o.value).toLowerCase() === String(r).toLowerCase()
        );
        return match ? String(match.value) : null;
      })
      .filter((v): v is string => !!v)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [data, orgId, roleOptions]);
  const legacyMembershipRoles = React.useMemo(() => {
    const raw = normalize(membership.roles);
    return raw
      .map((r) => {
        const match = roleOptions.find(
          (o) => String(o.value).toLowerCase() === r.toLowerCase()
        );
        return match ? String(match.value) : null;
      })
      .filter((v): v is string => !!v)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [membership.roles, roleOptions]);
  const backendRoles = userOrgRoles.length
    ? userOrgRoles
    : legacyMembershipRoles;
  const [roles, setRoles] = React.useState<string[]>(backendRoles);
  const backendSnapshot = React.useRef<string[]>(backendRoles);
  React.useEffect(() => {
    const snap = backendRoles;
    const a = [...backendSnapshot.current].sort();
    const b = [...roles].sort();
    const dirty = a.length !== b.length || a.some((v, i) => v !== b[i]);
    backendSnapshot.current = snap;
    if (!dirty) setRoles(snap);
  }, [backendRoles]);
  const updateRolesMut = useUpdateOrganizationMemberRoles(orgId, membershipId);
  const removeMut = useRemoveOrganizationMember(orgId);
  function toggleRole(r: string) {
    setRoles((prev) => {
      const lower = prev.map((x) => x.toLowerCase());
      const idx = lower.indexOf(r.toLowerCase());
      if (idx >= 0) {
        const clone = [...prev];
        clone.splice(idx, 1);
        return clone;
      }
      const found = roleOptions.find(
        (o) => String(o.value).toLowerCase() === r.toLowerCase()
      );
      return [...prev, found ? String(found.value) : r];
    });
  }
  const dirty = React.useMemo(() => {
    const a = [...backendSnapshot.current].sort();
    const b = [...roles].sort();
    return a.length !== b.length || a.some((v, i) => v !== b[i]);
  }, [roles]);
  function handleSave() {
    if (!roles.length || !dirty) return;
    updateRolesMut.mutate(
      { roles },
      {
        onSuccess: () => {
          backendSnapshot.current = [...roles];
          setRoles([...roles]);
          toast.success("نقش‌های کاربر ذخیره شد");
        },
        onError: (e: any) => toast.error(e?.message || "خطا در ذخیره نقش‌ها"),
      }
    );
  }
  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (removeMut.isPending) return;
    removeMut.mutate(membershipId, {
      onSuccess: () => toast.success("عضو حذف شد"),
      onError: (e: any) => toast.error(e?.message || "خطا در حذف عضو"),
    });
  }
  return (
    <div
      dir="rtl"
      className="flex flex-col gap-0.5 rounded-md px-1.5 py-1.5 text-[11px] transition-colors group border border-transparent hover:bg-accent/30">
      <div className="flex items-center gap-1.5 min-w-[16rem]">
        <Link
          href={`/dashboard/users/${userId}`}
          className="flex items-center gap-1.5 flex-1 min-w-0">
          <Avatar className="h-5 w-5 border">
            {data ? (
              <>
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={fullName} />
                ) : null}
                <AvatarFallback className="text-[9px]">
                  {initials}
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback className="text-[9px]">..</AvatarFallback>
            )}
          </Avatar>
          <span className="truncate text-[11px]" title={fullName}>
            {fullName}
          </span>
          {phone && (
            <span
              className="inline-flex items-center gap-1 text-[9px] text-muted-foreground"
              title={formatIranPhone(phone)}>
              <span className="ltr:font-mono">({formatIranPhone(phone)})</span>
            </span>
          )}
          {isLoading && !data && (
            <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground" />
          )}
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={removeMut.isPending}
            className={cn(
              "h-5 px-1.5 text-[9px] rounded-md border-rose-400 text-rose-600 hover:bg-rose-600 hover:text-white",
              removeMut.isPending &&
                "bg-rose-500 text-white border-rose-500 opacity-80"
            )}>
            {removeMut.isPending ? "…" : "حذف"}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 items-center pt-0.5">
        {roleOptions.map((opt) => {
          const active = roles.includes(opt.value);
          return (
            <OrgRoleBadge
              key={opt.value}
              role={opt.value as any}
              active={active}
              tone={active ? "solid" : "soft"}
              size="xs"
              withIcon
              tabIndex={0}
              aria-pressed={active}
              title={opt.label}
              onClick={() => toggleRole(opt.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleRole(opt.value);
                }
              }}
              className={cn(
                "cursor-pointer select-none transition h-5 px-1.5 text-[9px]",
                !active && "opacity-65 hover:opacity-100"
              )}
            />
          );
        })}
        <div className="ms-auto flex gap-1">
          <Button
            disabled={!dirty || updateRolesMut.isPending || roles.length === 0}
            onClick={handleSave}
            size="sm"
            variant={dirty ? "default" : "outline"}
            className={cn(
              "h-5 px-1.5 text-[9px] rounded-md",
              (!dirty || roles.length === 0) &&
                "cursor-not-allowed text-muted-foreground border-muted-foreground/20",
              updateRolesMut.isPending && "opacity-70"
            )}>
            {updateRolesMut.isPending ? "در حال ذخیره" : dirty ? "ذخیره" : "✔"}
          </Button>
          {dirty && (
            <Button
              onClick={() => setRoles(backendSnapshot.current)}
              size="sm"
              variant="outline"
              className="h-5 px-1.5 text-[9px] rounded-md border-muted-foreground/40">
              ریست
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MembersDropdown({ orgId, count }: MembersDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const lcQuery = query.trim().toLowerCase();

  // Fetch org data (optional, reserved for future aggregate usage)
  useOrganization(orgId, open); // intentionally ignoring orgData for now

  // Fetch memberships only when dropdown is open
  const {
    data: membershipList,
    isLoading: membershipLoading,
    isFetching: membershipFetching,
  } = useOrganizationMembers(orgId, { page: 1, pageSize: 200 }, open);

  // Gather userIds for enrichment once memberships are loaded
  const membershipUserIds = React.useMemo(
    () => (membershipList ? membershipList.map((m: any) => m.userId) : []),
    [membershipList]
  );

  // Enrich with user data map (users keyed by id)
  const { users: userMap } = useUsersByIds(membershipUserIds);

  // Filter logic supporting multi-term AND matching across name/email/phone/roles/userId
  const filteredMemberships = React.useMemo(() => {
    if (!membershipList) return [] as any[];
    if (!lcQuery) return membershipList;

    const terms = lcQuery.split(/\s+/).filter(Boolean);
    if (!terms.length) return membershipList;

    // Normalize Persian digits in query -> Latin (basic mapping)
    const persianDigitMap: Record<string, string> = {
      "۰": "0",
      "۱": "1",
      "۲": "2",
      "۳": "3",
      "۴": "4",
      "۵": "5",
      "۶": "6",
      "۷": "7",
      "۸": "8",
      "۹": "9",
    };
    const normalizeDigits = (s: string) =>
      s.replace(/[۰-۹]/g, (d) => persianDigitMap[d] || d);

    return membershipList.filter((m: any) => {
      const user = userMap[m.userId];
      const name = (user?.fullName || "").toLowerCase();
      const email = (user?.email || "").toLowerCase();
      const phoneRaw = (user?.phone || "").toString();
      const phoneDigits = normalizeDigits(phoneRaw).replace(/[^0-9+]/g, "");
      const roles = (m.roles || []).map((r: any) => String(r).toLowerCase());
      const haystack = [
        String(m.userId),
        name,
        email,
        phoneDigits,
        roles.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return terms.every((t) => {
        const tt = normalizeDigits(t);
        return haystack.includes(tt);
      });
    });
  }, [membershipList, lcQuery, userMap]);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
      className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen} dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-6 pl-2 pr-1 gap-1 text-[11px] font-medium bg-muted/60 hover:bg-muted/80 border-muted-foreground/20 inline-flex items-center",
              open && "ring-1 ring-primary/30"
            )}>
            <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="tabular-nums">{count != null ? count : "—"}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="w-[21rem] max-w-[92vw] mr-2 p-1"
          onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="flex items-center gap-1 text-xs">
            <UsersRound className="h-3.5 w-3.5" /> اعضای سازمان
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-1 pb-1">
            <div className="relative group">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-muted-foreground transition-colors">
                <Users2 className="h-3.5 w-3.5" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو کاربر / نقش..."
                className="w-full rounded-md border bg-background/70 pr-2 pl-8 h-7 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/50 transition"
                dir="rtl"
              />
            </div>
          </div>
          {(membershipLoading || membershipFetching) && (
            <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> در حال بارگذاری…
            </div>
          )}
          {!membershipLoading &&
            !membershipFetching &&
            (!membershipList || membershipList.length === 0) && (
              <div className="p-2 text-xs text-muted-foreground">
                عضوی یافت نشد
              </div>
            )}
          {!membershipLoading &&
            !membershipFetching &&
            membershipList &&
            membershipList.length > 0 &&
            lcQuery &&
            filteredMemberships.length === 0 && (
              <div className="p-2 text-xs text-muted-foreground">
                نتیجه‌ای مطابق جستجو یافت نشد
              </div>
            )}
          {!membershipLoading &&
          !membershipFetching &&
          filteredMemberships.length ? (
            <ScrollArea className="max-h-72 overflow-auto">
              <div className="p-0.5 space-y-0.5">
                {filteredMemberships.map((m: any) => (
                  <MemberRow
                    key={m.id}
                    orgId={orgId}
                    membership={{
                      membershipId: m.id, // real membership id
                      userId: m.userId,
                      roles: m.roles,
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAddOpen(true);
            }}>
            <PlusCircle className="h-3.5 w-3.5 ml-1" /> افزودن عضو جدید
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddMemberDialog orgId={orgId} open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

export default MembersDropdown;
