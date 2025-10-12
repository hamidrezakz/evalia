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
import { Input } from "@/components/ui/input";
import {
  useCreateOrganization,
  useCreateOrganizationRelationship,
  useOrganizationCapabilities,
} from "../api/organization-hooks";
import {
  OrgPlanEnum,
  LocaleEnum,
  OrganizationStatusEnum,
  OrganizationCapabilityEnum,
} from "@/lib/enums";
import {
  OrgPlanBadge,
  OrganizationStatusBadge,
} from "@/components/status-badges";
import { OrganizationCapabilityBadge } from "@/components/status-badges";
import { cn } from "@/lib/utils";
import { useOrgState } from "../context/org-context";
import { Badge } from "@/components/ui/badge";

interface AddOrganizationDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const initialState = {
  name: "",
  slug: "",
  plan: "FREE" as string | null,
  locale: "FA" as string | null,
  status: "ACTIVE" as string | null, // local-only (API sets default ACTIVE; we keep for future if backend allows)
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tehran",
};

export default function AddOrganizationDialog({
  open,
  onOpenChange,
}: AddOrganizationDialogProps) {
  const createMut = useCreateOrganization();
  const relMut = useCreateOrganizationRelationship();
  const { activeOrganizationId, organizations } = useOrgState();
  const parentOrg = organizations.find(
    (o: any) => o?.id === activeOrganizationId
  );
  const capsQ = useOrganizationCapabilities(
    activeOrganizationId ?? null,
    !!activeOrganizationId
  );
  const capabilities = (capsQ.data as any[]) || [];
  const hasMasterCapability = !activeOrganizationId
    ? true
    : capabilities.some(
        (c) => c?.capability === "MASTER" && (c?.active ?? true)
      );
  const [form, setForm] = React.useState(initialState);

  React.useEffect(() => {
    if (!open) setForm(initialState);
  }, [open]);

  function handleSubmit() {
    if (!form.name.trim()) return;
    createMut.mutate(
      {
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        plan: (form.plan as any) || undefined,
        locale: (form.locale as any) || undefined,
        timezone: form.timezone || undefined,
        // status intentionally omitted unless backend later supports custom initial status
      },
      {
        onSuccess: (res) => {
          const newOrgId = (res as any)?.data?.id;
          if (activeOrganizationId && newOrgId) {
            // Create parent-child relationship automatically
            relMut.mutate(
              {
                parentOrganizationId: activeOrganizationId,
                childOrganizationId: newOrgId,
                relationshipType: "PARENT_CHILD" as any,
                cascadeResources: true,
              },
              {
                onSettled: () => onOpenChange(false),
              }
            );
          } else {
            onOpenChange(false);
          }
        },
      }
    );
  }

  const planOptions = OrgPlanEnum.options();
  const localeOptions = LocaleEnum.options();
  const statusOptions = OrganizationStatusEnum.options();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">افزودن سازمان جدید</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right">
          {/* Parent organization info */}
          {activeOrganizationId ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px]">
              این سازمان به عنوان زیرمجموعه «
              <span className="font-medium">
                {parentOrg?.name || `#${activeOrganizationId}`}
              </span>
              » ثبت خواهد شد.
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              نکته: با انتخاب یک «سازمان فعال»، سازمان جدید به صورت خودکار به
              عنوان زیرمجموعه آن ثبت می‌شود.
            </div>
          )}

          {/* Active org capabilities status */}
          {activeOrganizationId && (
            <div className="rounded-md border p-3 text-[11px]">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">قابلیت‌های سازمان فعال</span>
                {capsQ.isLoading && (
                  <span className="text-muted-foreground">در حال دریافت…</span>
                )}
                {capsQ.error && (
                  <span className="text-rose-600">خطا در دریافت قابلیت‌ها</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {capabilities.length > 0 ? (
                  capabilities
                    .slice()
                    .sort(
                      (a, b) =>
                        Number(b?.active ?? true) - Number(a?.active ?? true)
                    )
                    .map((cap) => {
                      const active = cap?.active ?? true;
                      return (
                        <OrganizationCapabilityBadge
                          key={cap.capability}
                          capability={cap.capability as any}
                          active={active}
                          tone={active ? "soft" : "outline"}
                          size="xs"
                        />
                      );
                    })
                ) : (
                  <span className="text-muted-foreground">
                    قابلیتی ثبت نشده است
                  </span>
                )}
              </div>
              {!hasMasterCapability && !capsQ.isLoading && !capsQ.error && (
                <div className="mt-2 rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1.5">
                  سازمان فعال شما قابلیت «سازمان مادر (MASTER)» را ندارد. برای
                  افزودن زیرسازمان، ابتدا این قابلیت را برای سازمان فعال فعال
                  کنید.
                </div>
              )}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium">نام *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثلاً: شرکت اندیشه نو"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center justify-between">
              <span>Slug (اختیاری)</span>
              <span className="text-[10px] text-muted-foreground ltr:font-mono">
                only a-z0-9-
              </span>
            </label>
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))
              }
              placeholder="example-co"
              dir="ltr"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">پلن</label>
              <div className="flex flex-wrap gap-1 bg-muted/10 p-2 rounded-md ring-1 ring-inset ring-border/50">
                {planOptions.map((opt) => {
                  const active = form.plan === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, plan: opt.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setForm((f) => ({ ...f, plan: opt.value }));
                        }
                      }}
                      aria-pressed={active}
                      className="focus:outline-none">
                      <OrgPlanBadge
                        plan={opt.value as any}
                        tone={active ? "solid" : "soft"}
                        size="xs"
                        withIcon
                        className={cn(
                          "cursor-pointer select-none",
                          !active && "opacity-75 hover:opacity-100"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">زبان</label>
              <div className="flex flex-wrap gap-1 bg-muted/10 p-2 rounded-md ring-1 ring-inset ring-border/50">
                {localeOptions.map((opt) => {
                  const active = form.locale === opt.value;
                  return (
                    <span
                      key={opt.value}
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      onClick={() =>
                        setForm((f) => ({ ...f, locale: opt.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setForm((f) => ({ ...f, locale: opt.value }));
                        }
                      }}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] border transition-colors cursor-pointer",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent border-muted-foreground/30"
                      )}>
                      {opt.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1">
              وضعیت اولیه (فقط ACTIVE فعلاً)
            </label>
            <div className="flex flex-wrap gap-1 bg-muted/10 p-2 rounded-md ring-1 ring-inset ring-border/50">
              {statusOptions.map((opt) => {
                const active = form.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, status: opt.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setForm((f) => ({ ...f, status: opt.value }));
                      }
                    }}
                    aria-pressed={active}
                    className="focus:outline-none">
                    <OrganizationStatusBadge
                      status={opt.value as any}
                      tone={active ? "solid" : "soft"}
                      size="xs"
                      className={cn(
                        "cursor-pointer select-none",
                        !active && "opacity-70 hover:opacity-100"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground pr-1">
              (در API فعلاً همیشه ACTIVE ایجاد می‌شود؛ این انتخاب برای آینده
              نگه‌داری می‌شود)
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center justify-between">
              <span>منطقه زمانی</span>
              <span className="text-[10px] text-muted-foreground ltr:font-mono">
                {form.timezone}
              </span>
            </label>
            <Input
              value={form.timezone}
              onChange={(e) =>
                setForm((f) => ({ ...f, timezone: e.target.value }))
              }
              placeholder="Asia/Tehran"
              dir="ltr"
            />
          </div>
          {createMut.error && (
            <div className="text-[11px] text-rose-600">
              {(createMut.error as any)?.message || "خطا در ایجاد"}
            </div>
          )}
        </div>
        <DialogFooter className="justify-start gap-2 pt-2">
          <Button
            size="sm"
            disabled={
              !form.name.trim() ||
              createMut.isPending ||
              relMut.isPending ||
              (!!activeOrganizationId && !hasMasterCapability)
            }
            onClick={handleSubmit}>
            {createMut.isPending || relMut.isPending
              ? "در حال ثبت..."
              : "ایجاد"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={createMut.isPending || relMut.isPending}>
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
