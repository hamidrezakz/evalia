"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Link as LinkIcon,
  Plus,
  Copy,
  RefreshCw,
  Tag,
  Hash,
  Users,
  UserCheck,
  Power,
  Globe,
} from "lucide-react";
import {
  useSessionInviteLinks,
  useCreateSessionInviteLink,
  useUpdateSessionInviteLink,
  enrichInviteLinks,
} from "@/assessment/api/invite-links-hooks";
import type { CreateInviteLinkBody } from "@/assessment/api/invite-links.api";
import { cn } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/lib/notifications";
import { parseJalali, formatJalali } from "@/lib/jalali-date";
import { InviteLinkActionMenu } from "@/assessment/components/invite-links/InviteLinkActionMenu";
import {
  InviteLinkStatusBadge,
  AutoJoinBadge,
  AutoAssignSelfBadge,
  DomainsBadge,
} from "@/assessment/components/invite-links/InviteLinkBadges";

export interface SessionInviteLinksDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  organizationId: number | null;
  sessionId: number | null;
  baseAppUrl?: string; // optional override for generating full URL
}

export default function SessionInviteLinksDialog({
  open,
  onOpenChange,
  organizationId,
  sessionId,
  baseAppUrl,
}: SessionInviteLinksDialogProps) {
  const listQ = useSessionInviteLinks(organizationId, sessionId);
  const createMut = useCreateSessionInviteLink(organizationId, sessionId);
  const updateMut = useUpdateSessionInviteLink(organizationId, sessionId);
  const [form, setForm] = React.useState<CreateInviteLinkBody>({
    autoAssignSelf: true,
    autoJoinOrg: true,
    enabled: true,
    maxUses: 1,
  });
  const [creating, setCreating] = React.useState(false);
  // Domains field is disabled for now (kept empty intentionally)

  const links = React.useMemo(() => {
    const data = (listQ.data as any)?.data || [];
    return enrichInviteLinks(data);
  }, [listQ.data]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId || !sessionId) return;
    try {
      setCreating(true);
      await createMut.mutateAsync(form);
      setForm((f) => ({ ...f, label: "" }));
    } finally {
      setCreating(false);
    }
  }

  function fullUrl(token: string) {
    // Prefer configured app base, then prop override, then current origin
    const envBase = (process.env.NEXT_PUBLIC_APP_BASE || "").trim();
    const base =
      envBase ||
      baseAppUrl ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return base.replace(/\/$/, "") + "/invite/" + token;
  }

  async function copyToken(token: string) {
    const text = fullUrl(token);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        notifySuccess("لینک دعوت کپی شد");
        return;
      }
    } catch {
      // fallback below
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      notifySuccess("لینک دعوت کپی شد");
    } catch (e) {
      notifyError("کپی لینک با خطا مواجه شد");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <LinkIcon className="h-4 w-4" /> لینک‌های دعوت جلسه
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
          <section className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">
              لینک‌های موجود
            </h3>
            <div className="flex flex-col gap-2">
              {listQ.isLoading && (
                <div className="text-xs text-muted-foreground">
                  در حال بارگذاری…
                </div>
              )}
              {!listQ.isLoading && links.length === 0 && (
                <div className="text-xs text-muted-foreground/80">
                  لینکی ساخته نشده است.
                </div>
              )}
              {links.map((l) => (
                <div
                  key={l.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-[11px]",
                    !l.enabled && "opacity-60"
                  )}>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span
                      className="truncate font-medium text-foreground/90"
                      title={l.label || l.token}>
                      {l.label || l.token.slice(0, 10) + "…"}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/80">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {l.expiresAt
                          ? formatJalali(parseJalali(l.expiresAt), false)
                          : "بدون انقضا"}
                      </span>
                      {typeof l.maxUses === "number" && (
                        <span>
                          استفاده: {(l.usedCount || 0) + "/" + l.maxUses}
                          {typeof l.remaining === "number" &&
                            l.remaining >= 0 &&
                            ` (باقی: ${l.remaining})`}
                        </span>
                      )}
                      {l.autoJoinOrg && <AutoJoinBadge />}
                      {l.autoAssignSelf && <AutoAssignSelfBadge />}
                      {Array.isArray(l.allowedDomains) &&
                        l.allowedDomains.length > 0 && (
                          <DomainsBadge count={l.allowedDomains.length} />
                        )}
                      <InviteLinkStatusBadge status={l.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyToken(l.token)}
                      title="کپی لینک">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <InviteLinkActionMenu
                      enabled={l.enabled}
                      autoJoinOrg={l.autoJoinOrg}
                      autoAssignSelf={l.autoAssignSelf}
                      onToggleEnabled={() =>
                        updateMut.mutate({
                          id: l.id,
                          body: { enabled: !l.enabled },
                        })
                      }
                      onToggleAutoJoin={() =>
                        updateMut.mutate({
                          id: l.id,
                          body: { autoJoinOrg: !l.autoJoinOrg },
                        })
                      }
                      onToggleAutoAssign={() =>
                        updateMut.mutate({
                          id: l.id,
                          body: { autoAssignSelf: !l.autoAssignSelf },
                        })
                      }
                      onEditLabel={() => {
                        const v = prompt(
                          "برچسب جدید را وارد کنید",
                          l.label || ""
                        );
                        if (v !== null)
                          updateMut.mutate({
                            id: l.id,
                            body: { label: v || null },
                          });
                      }}
                      onEditMaxUses={() => {
                        const v = prompt(
                          "حداکثر استفاده (خالی = نامحدود)",
                          l.maxUses?.toString() || ""
                        );
                        if (v === null) return;
                        const num = v.trim() === "" ? null : Number(v);
                        if (
                          v.trim() === "" ||
                          (!Number.isNaN(num) && num! >= 1)
                        ) {
                          updateMut.mutate({
                            id: l.id,
                            body: { maxUses: num as any },
                          });
                        } else {
                          // no-op; could toast invalid
                        }
                      }}
                      onEditExpiry={() => {
                        alert("قابلیت تاریخ انقضا به زودی اضافه می‌شود.");
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">
              ایجاد لینک جدید
            </h3>
            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-3 text-[11px]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground">
                    برچسب (اختیاری)
                  </label>
                  <div className="relative">
                    <Input
                      value={form.label || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, label: e.target.value }))
                      }
                      placeholder="مثلاً لینک کانال داخلی"
                      className="h-8 pl-8"
                    />
                    <Tag className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-60">
                  <label className="text-[10px] text-muted-foreground">
                    تاریخ انقضا (به زودی)
                  </label>
                  <div className="relative">
                    <Input disabled value="—" className="h-8 pl-8" />
                    <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground">
                    حداکثر استفاده (تهی = نامحدود)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={form.maxUses ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          maxUses: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      className="h-8 pl-8"
                    />
                    <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                  <span className="text-[10px] inline-flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground/70" /> عضویت
                    خودکار در سازمان
                  </span>
                  <Switch
                    checked={!!form.autoJoinOrg}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, autoJoinOrg: v }))
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                  <span className="text-[10px] inline-flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-muted-foreground/70" />{" "}
                    تخصیص خودکار SELF
                  </span>
                  <Switch
                    checked={!!form.autoAssignSelf}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, autoAssignSelf: v }))
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                  <span className="text-[10px] inline-flex items-center gap-1">
                    <Power className="h-3 w-3 text-muted-foreground/70" /> فعال
                  </span>
                  <Switch
                    checked={!!form.enabled}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, enabled: v }))
                    }
                  />
                </label>
              </div>
              <div className="flex items-center justify-start gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="h-8"
                  disabled={createMut.isPending || creating}>
                  <Plus className="h-4 w-4" />
                  <span className="mr-1">ایجاد لینک</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => listQ.refetch()}
                  disabled={listQ.isFetching}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
