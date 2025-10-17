"use client";
import * as React from "react";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Camera,
  Users2,
  Building2,
  Layers,
  Crown,
  RefreshCcw,
} from "lucide-react";
import { PlatformRoleEnum, OrgRoleEnum } from "@/lib/enums";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { parseJalali, formatJalali } from "@/lib/jalali-date";
import { Button } from "@/components/ui/button";
import { UserStatusBadge } from "@/components/status-badges/UserStatusBadge";
import { uploadMyAvatar } from "@/users/api/user-avatar.api";
import { useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "@/users/api/users-query-keys";
import { useAvatarImage } from "@/users/api/useAvatarImage";
import { formatFa } from "@/lib/metrics";

interface StatItemProps {
  icon: React.ComponentType<any>;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}

function StatItem({ icon: Icon, label, value, loading }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/40 px-3 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-1 text-right" dir="rtl">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        {loading ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <span className="text-sm font-semibold tabular-nums">{value}</span>
        )}
      </div>
    </div>
  );
}

export interface DashboardUserHeaderPanelProps {
  user: any;
  userId: number | null;
  mounted: boolean;
  activeOrg: any;
  activeRole: string | null;
  activeRoleSource: string | null;
  totalOrgs: number;
  rolesCount: number;
  totalUserSessions: number;
  completedByProgress: number;
  avgPercent: number;
  loading: boolean; // overall loading (user/org)
  sessionsLoading: boolean;
  orgLoading: boolean;
}

export function DashboardUserHeaderPanel({
  user,
  userId,
  mounted,
  activeOrg,
  activeRole,
  activeRoleSource,
  totalOrgs,
  rolesCount,
  totalUserSessions,
  completedByProgress,
  avgPercent,
  loading,
  sessionsLoading,
  orgLoading,
}: DashboardUserHeaderPanelProps) {
  const qc = useQueryClient();

  // Dates
  const createdAt = user?.createdAt;
  let createdAtPretty: string | null = null;
  if (createdAt) {
    try {
      createdAtPretty = formatJalali(parseJalali(createdAt));
    } catch {
      createdAtPretty = null;
    }
  }
  const updatedAt = user?.updatedAt || user?.lastUpdatedAt;
  let updatedAtPretty: string | null = null;
  if (updatedAt) {
    try {
      updatedAtPretty = formatJalali(parseJalali(updatedAt), true);
    } catch {
      updatedAtPretty = null;
    }
  }

  // Avatar handling
  const rawAvatar = (user as any)?.avatarUrl || (user as any)?.avatar || null;
  const { src: resolvedAvatar } = useAvatarImage(rawAvatar);
  const [localAvatar, setLocalAvatar] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  function onAvatarClick() {
    fileInputRef.current?.click();
  }
  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است.");
      e.target.value = "";
      setAvatarError("فرمت فایل نامعتبر است");
      return;
    }
    const MAX_AVATAR_BYTES = 100 * 1024;
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("حجم تصویر آواتار نباید بیشتر از ۱۰۰ کیلوبایت باشد.");
      setAvatarError("حجم فایل انتخابی بیشتر از ۱۰۰ کیلوبایت است");
      e.target.value = "";
      return;
    }
    setAvatarError(null);
    const url = URL.createObjectURL(file);
    setLocalAvatar(url);
    toast.info(
      "پیش‌نمایش تصویر اعمال شد. برای ذخیره دائم، اتصال به سرور لازم است."
    );
    (async () => {
      try {
        const asset = await uploadMyAvatar(file);
        if (typeof userId === "number") {
          toast.success("تصویر پروفایل با موفقیت ذخیره شد.");
          await qc.invalidateQueries({ queryKey: usersKeys.byId(userId) });
        }
      } catch (err: any) {
        const code = err?.code || "";
        if (
          code === "AVATAR_FILE_TOO_LARGE" ||
          /AVATAR_FILE_TOO_LARGE/.test(err?.message || "")
        ) {
          toast.error("حجم تصویر آواتار نباید بیشتر از ۱۰۰ کیلوبایت باشد.");
          setAvatarError("حجم فایل انتخابی بیشتر از ۱۰۰ کیلوبایت است");
        } else {
          toast.error(err?.message || "خطا در آپلود تصویر");
          setAvatarError("خطا در آپلود تصویر");
        }
      } finally {
        e.target.value = "";
      }
    })();
  }

  const fullName = user?.fullName || user?.name || user?.email || "کاربر";
  const initials = fullName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase();

  return loading ? (
    <div>
      {/* Could alternatively import DashboardHeaderSkeleton directly here if desired */}
      <Panel>
        <PanelHeader className="py-10 flex items-center justify-center text-muted-foreground text-sm">
          <Skeleton className="h-20 w-20 rounded-2xl" />
        </PanelHeader>
      </Panel>
    </div>
  ) : (
    <Panel>
      <PanelHeader className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative">
            <Avatar
              onClick={onAvatarClick}
              className="h-20 w-20 rounded-2xl border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/40 transition">
              {(localAvatar || resolvedAvatar) && (
                <AvatarImage
                  src={localAvatar || resolvedAvatar || undefined}
                  alt={fullName}
                />
              )}
              <AvatarFallback className="rounded-2xl text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={onAvatarClick}
              title="تغییر تصویر پروفایل"
              className="absolute -bottom-1 -left-1 h-7 w-7 rounded-full bg-background/90 border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-background/100 transition">
              <Camera className="h-4 w-4" />
              <span className="sr-only">آپلود آواتار</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            {avatarError && (
              <p
                className="mt-1 text-[10px] text-destructive/80 max-w-[160px] leading-4"
                dir="rtl">
                {avatarError}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 text-right">
            <PanelTitle className="flex items-center flex-wrap gap-3 text-lg font-semibold leading-6">
              <span>{fullName}</span>
              <UserStatusBadge status={user?.status} />
              {mounted && activeOrg && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {activeOrg.name}
                </span>
              )}
              {mounted && activeRole && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border/60">
                  {activeRoleSource === "platform" ? (
                    <Crown className="h-3 w-3" />
                  ) : (
                    <Building2 className="h-3 w-3" />
                  )}
                  {activeRoleSource === "platform"
                    ? PlatformRoleEnum.t(activeRole as any)
                    : OrgRoleEnum.t(activeRole as any)}
                </span>
              )}
            </PanelTitle>
            <PanelDescription className="text-[11px] flex flex-wrap gap-4 items-center">
              {createdAtPretty && (
                <span className="inline-flex items-center gap-1">
                  <span className="opacity-60">ایجاد:</span>
                  <span className="font-medium">{createdAtPretty}</span>
                </span>
              )}
              {updatedAtPretty && (
                <span className="inline-flex items-center gap-1">
                  <RefreshCcw className="h-3 w-3 opacity-60" />
                  <span className="opacity-60">آپدیت:</span>
                  <span className="font-medium">{updatedAtPretty}</span>
                </span>
              )}
              {user?.email && (
                <span className="inline-flex items-center gap-1 ltr:font-mono">
                  <span className="opacity-60">ایمیل:</span>
                  <span>{user.email}</span>
                </span>
              )}
            </PanelDescription>
          </div>
        </div>
      </PanelHeader>
      <PanelContent className="flex flex-col gap-6">
        <div className="grid gap-4 xl:grid-cols-4 sm:grid-cols-2">
          <StatItem
            icon={Building2}
            label="سازمان‌های عضو"
            value={
              <span className="inline-flex items-center gap-1">
                <span>{formatFa(totalOrgs)}</span>
                {mounted && activeOrg ? (
                  <span className="text-[9px] text-muted-foreground inline-flex items-center gap-1">
                    <span>(</span>
                    <span>سازمان فعال:</span>
                    <span className="font-medium">{activeOrg.name}</span>
                    <span>)</span>
                  </span>
                ) : null}
              </span>
            }
            loading={!mounted || orgLoading}
          />
          <StatItem
            icon={Layers}
            label="نقش‌های کاربری"
            value={
              <span className="inline-flex items-center gap-1">
                <span>{formatFa(rolesCount)}</span>
                {mounted && activeRole ? (
                  <span className="text-[9px] text-muted-foreground inline-flex items-center gap-1">
                    <span>(</span>
                    <span>نقش فعال:</span>
                    <span className="font-medium">
                      {activeRoleSource === "platform"
                        ? PlatformRoleEnum.t(activeRole as any)
                        : OrgRoleEnum.t(activeRole as any)}
                    </span>
                    <span>)</span>
                  </span>
                ) : null}
              </span>
            }
            loading={!mounted || orgLoading}
          />
          <StatItem
            icon={Users2}
            label="آزمون‌های من"
            value={formatFa(totalUserSessions)}
            loading={!mounted || sessionsLoading}
          />
          <StatItem
            icon={Crown}
            label="تکمیل شده / درصد"
            value={`${formatFa(completedByProgress)} (${formatFa(avgPercent, {
              percent: true,
            })})`}
            loading={!mounted || sessionsLoading}
          />
        </div>
      </PanelContent>
    </Panel>
  );
}

// (Enums imported at top)
