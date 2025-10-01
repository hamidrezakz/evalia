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
import { useCreateOrganization } from "../api/organization-hooks";
import { OrgPlanEnum, LocaleEnum, OrganizationStatusEnum } from "@/lib/enums";
import {
  OrgPlanBadge,
  OrganizationStatusBadge,
} from "@/components/status-badges";
import { cn } from "@/lib/utils";

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
        onSuccess: () => {
          onOpenChange(false);
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
            disabled={!form.name.trim() || createMut.isPending}
            onClick={handleSubmit}>
            {createMut.isPending ? "در حال ثبت..." : "ایجاد"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={createMut.isPending}>
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
