"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAddMembersToTeam } from "@/organizations/team/api/team-members-hooks";
import UserSelectCombobox from "@/users/components/UserSelectCombobox";
import { Loader2, UserPlus, Trash2, Check, X } from "lucide-react";
import { useUsersByIds } from "@/users/api/users-hooks";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatIranPhone } from "@/lib/utils";
import { useOrganization } from "../api/organization-hooks";

interface AddTeamMembersDialogProps {
  orgId: number;
  teamId: number | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AddTeamMembersDialog({
  orgId,
  teamId,
  open,
  onOpenChange,
}: AddTeamMembersDialogProps) {
  // Fetch organization (to display org / team name instead of raw ids)
  const { data: org, isLoading: orgLoading } = useOrganization(orgId, open);
  const addMut = useAddMembersToTeam(orgId, teamId);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [list, setList] = React.useState<number[]>([]);
  const [submitted, setSubmitted] = React.useState(false);

  function handleAddLocal() {
    if (selected && !list.includes(selected)) {
      setList((l) => [...l, selected]);
      setSelected(null);
    }
  }

  function handleSubmit() {
    if (!teamId || list.length === 0) return;
    setSubmitted(false);
    addMut.mutate(list, {
      onSuccess: () => {
        setSubmitted(true);
        setList([]);
        setTimeout(() => {
          onOpenChange(false);
          setSubmitted(false);
        }, 900);
      },
    });
  }

  // Resolve selected users' detail data for nicer list rendering
  const { users: userMap, loadingIds } = useUsersByIds(list);

  // Pure helper (no hooks) to resolve avatar path similarly to useAvatarImage
  function resolveAvatar(raw: string | null | undefined) {
    if (!raw) return null;
    try {
      if (/^https?:\/\//i.test(raw)) {
        const u = new URL(raw);
        const cdn = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/$/, "");
        if (u.pathname.startsWith("/avatars/") && cdn)
          return cdn + u.pathname + (u.search || "");
        return raw;
      }
    } catch {}
    const cdn = (process.env.NEXT_PUBLIC_CDN_BASE || "").replace(/\/$/, "");
    const api = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
    if (raw.startsWith("/avatars/")) return cdn ? cdn + raw : raw;
    if (raw.startsWith("/")) return api ? api + raw : raw;
    return raw;
  }

  function renderUserRow(userId: number) {
    const u = userMap[userId];
    if (!u) {
      return (
        <div
          key={userId}
          className="flex items-center justify-between gap-2 px-2 py-1 text-[11px]">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> در حال دریافت کاربر #
            {userId}
          </span>
          <button
            type="button"
            onClick={() => setList((l) => l.filter((x) => x !== userId))}
            className="text-rose-600 hover:text-rose-700">
            حذف
          </button>
        </div>
      );
    }
    const initials =
      (u.fullName || u.email || "?")
        .split(" ")
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("") || "?";
    const rawAvatar = (u as any).avatarUrl || (u as any).avatar || null;
    const resolvedAvatar = resolveAvatar(rawAvatar);
    return (
      <div
        key={userId}
        className="group flex items-center justify-between gap-2 px-2 py-1 hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-7 w-7 shrink-0 ring-1 ring-border/50">
            {resolvedAvatar && (
              <AvatarImage
                src={resolvedAvatar}
                alt={u.fullName || u.email || String(u.id)}
                className="object-cover"
              />
            )}
            <AvatarFallback className="text-[10px] bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 leading-tight text-[11px]">
            <span className="font-medium truncate">
              {u.fullName || u.email || `کاربر #${u.id}`}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {u.phone ? formatIranPhone(u.phone) : u.email}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setList((l) => l.filter((x) => x !== userId))}
          className="rounded px-1 py-0.5 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
          حذف
        </button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {(() => {
              if (orgLoading) return "در حال بارگذاری...";
              const teamName = org?.teams?.find(
                (t: any) => t.id === teamId
              )?.name;
              if (teamName) return `افزودن اعضا به تیم «${teamName}»`;
              if (org?.name) return `افزودن اعضا به تیم های ${org.name}`;
              return "افزودن اعضا به تیم";
            })()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right">
          <div className="space-y-2">
            <UserSelectCombobox
              value={selected}
              onChange={(id) => setSelected(id)}
              orgId={orgId}
              placeholder="جستجوی کاربر سازمان..."
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddLocal}
                disabled={!selected || addMut.isPending}
                variant="secondary"
                className="flex items-center gap-1 h-7 px-2 text-[11px]">
                <UserPlus className="h-3.5 w-3.5" /> افزودن به لیست
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setList([])}
                disabled={list.length === 0 || addMut.isPending}
                className="flex items-center gap-1 h-7 px-2 text-[11px]">
                <Trash2 className="h-3.5 w-3.5" /> پاک کردن
              </Button>
            </div>
          </div>
          <div className="rounded-md border shadow-sm bg-background/50 backdrop-blur-sm">
            <div className="bg-muted/30 px-2 py-1.5 text-[11px] font-medium flex items-center justify-between">
              <span className="flex items-center gap-1">
                لیست انتخابی ({list.length})
                {loadingIds.length > 0 && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </span>
              {addMut.isPending && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> در حال ثبت
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-auto text-[11px]">
              {list.length === 0 && (
                <div className="p-3 text-center text-muted-foreground text-[11px]">
                  موردی انتخاب نشده
                </div>
              )}
              {list.map((id) => renderUserRow(id))}
            </div>
          </div>
          {addMut.error && (
            <div className="text-[11px] text-rose-600">
              {(() => {
                const err: any = addMut.error;
                const msg = err?.response?.data?.message || err?.message;
                if (Array.isArray(msg)) return msg.join("، ");
                if (typeof msg === "string" && msg.trim()) return msg;
                return "خطا در ثبت – لطفاً دوباره تلاش کنید";
              })()}
            </div>
          )}
          {submitted && !addMut.error && !addMut.isPending && (
            <div className="flex items-center gap-1 text-emerald-600 text-[11px]">
              <Check className="h-3 w-3" /> ثبت شد
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            size="sm"
            className="w-full sm:w-auto flex items-center gap-1"
            disabled={list.length === 0 || addMut.isPending}
            onClick={handleSubmit}>
            {addMut.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> در حال ثبت...
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" /> افزودن اعضا
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full sm:w-auto flex items-center gap-1"
            disabled={addMut.isPending}
            onClick={() => onOpenChange(false)}>
            <X className="h-3.5 w-3.5" /> بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddTeamMembersDialog;
