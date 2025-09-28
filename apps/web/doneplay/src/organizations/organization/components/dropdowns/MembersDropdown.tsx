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
import { toast } from "sonner";
import { useAvatarImage } from "@/users/api/useAvatarImage";

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
  // Avatar image via standard hook (fetch + cache + absolute URL resolution)
  const { src: avatarUrl, isLoading: avatarLoading } = useAvatarImage(
    (data as any)?.avatarUrl || (data as any)?.avatar
  );
  // 1) Try to get roles from user detail (source of truth now) for this orgId
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

  // 2) Fallback to membership.roles (legacy) if user detail has not loaded yet
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
  // When backend roles change, update snapshot and (if not dirty) sync UI
  React.useEffect(() => {
    const snap = backendRoles;
    const dirty = (() => {
      const a = [...backendSnapshot.current].sort();
      const b = [...roles].sort();
      return a.length !== b.length || a.some((v, i) => v !== b[i]);
    })();
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
      // ensure we push the canonical value (if exists)
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
    if (!roles.length || !dirty) return; // enforce at least one & changed
    updateRolesMut.mutate(
      { roles },
      {
        onSuccess: () => {
          // Optimistically mark snapshot so highlighting updates immediately
          backendSnapshot.current = [...roles];
          setRoles([...roles]);
          toast.success("نقش‌های کاربر ذخیره شد");
        },
        onError: (e: any) => {
          toast.error(e?.message || "خطا در ذخیره نقش‌ها");
        },
      }
    );
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (removeMut.isPending) return;
    const prev = roles;
    removeMut.mutate(membershipId, {
      onSuccess: () => toast.success("عضو حذف شد"),
      onError: (e: any) => {
        toast.error(e?.message || "خطا در حذف عضو");
        // optional: rollback UI if we had optimistic removal (not applied yet)
      },
    });
  }

  return (
    <div
      dir="rtl"
      className={cn(
        "flex flex-col gap-1 rounded-md px-2 py-2 text-xs transition-colors group border border-transparent hover:bg-accent/40"
      )}>
      <div className="flex items-center gap-2 min-w-[18rem]">
        <Link
          href={`/dashboard/users/${userId}`}
          className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar className="h-6 w-6 border">
            {data ? (
              <>
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={fullName} />
                ) : null}
                <AvatarFallback className="text-[10px]">
                  {initials}
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback className="text-[10px]">..</AvatarFallback>
            )}
          </Avatar>
          <span className="truncate" title={fullName}>
            {fullName}
          </span>
          {phone && (
            <span
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
              title={formatIranPhone(phone)}>
              <span className="ltr:font-mono">({formatIranPhone(phone)})</span>
            </span>
          )}
          {isLoading && !data && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {/* Removed inline role chips beside name as requested */}
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={removeMut.isPending}
            className={cn(
              "h-6 px-2 text-[10px] rounded-md border-rose-400 text-rose-600 hover:bg-rose-600 hover:text-white",
              removeMut.isPending && "bg-rose-500 text-white border-rose-500"
            )}>
            {removeMut.isPending ? "…" : "حذف"}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 items-center pt-1">
        {roleOptions.map((opt) => {
          const active = roles.includes(opt.value);
          return (
            <Button
              key={opt.value}
              type="button"
              onClick={() => toggleRole(opt.value)}
              variant={active ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-6 px-2 text-[10px] font-medium rounded-md",
                !active && "text-muted-foreground border-muted-foreground/30",
                active && "bg-primary/90"
              )}>
              {opt.label}
            </Button>
          );
        })}
        <div className="ms-auto flex gap-1">
          <Button
            disabled={!dirty || updateRolesMut.isPending || roles.length === 0}
            onClick={handleSave}
            size="sm"
            variant={dirty ? "default" : "outline"}
            className={cn(
              "h-6 px-2 text-[10px] rounded-md",
              (!dirty || roles.length === 0) &&
                "cursor-not-allowed text-muted-foreground border-muted-foreground/20",
              updateRolesMut.isPending && "opacity-70"
            )}>
            {updateRolesMut.isPending
              ? "در حال ذخیره..."
              : dirty
              ? "ذخیره"
              : "ذخیره شد"}
          </Button>
          {dirty && (
            <Button
              onClick={() => setRoles(backendSnapshot.current)}
              size="sm"
              variant="outline"
              className="h-6 px-2 text-[10px] rounded-md border-muted-foreground/40">
              بازنشانی
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MembersDropdown({ orgId, count }: MembersDropdownProps) {
  const [open, setOpen] = React.useState(false);
  // Fetch lightweight org detail only when open (for potential counts etc.)
  const { data: orgData } = useOrganization(orgId, open);
  // Fetch actual membership list (contains membership id + roles) when open
  const {
    data: membershipList,
    isLoading: membershipLoading,
    isFetching: membershipFetching,
  } = useOrganizationMembers(orgId, {}, open);
  const [addOpen, setAddOpen] = React.useState(false);

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
          className="w-fit mr-2"
          onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="flex items-center gap-1 text-xs">
            <UsersRound className="h-3.5 w-3.5" /> اعضای سازمان
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
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
          membershipList?.length ? (
            <ScrollArea className="max-h-80 overflow-auto">
              <div className="p-1 space-y-0.5">
                {membershipList.map((m: any) => (
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
