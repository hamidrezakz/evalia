"use client";
import * as React from "react";
import { useAuthSession } from "@/app/auth/event-context/session-context";
import { useUser } from "@/users/api/users-hooks";
// Org context alignment
import { useOrgState } from "@/organizations/organization/context";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  parseJalali,
  formatJalali,
  formatJalaliRelative,
} from "@/lib/jalali-date";
import { cn } from "@/lib/utils";
import {
  Users2,
  Building2,
  Layers,
  Crown,
  RefreshCcw,
  Calendar,
  Clock,
  Hash,
  Briefcase,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  useUserSessions,
  useSessionQuestionCount,
} from "@/assessment/api/templates-hooks";
import { SessionStateEnum, PlatformRoleEnum, OrgRoleEnum } from "@/lib/enums";
import { useAssessmentUserSessions } from "@/assessment/context/assessment-user-sessions";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { getUserProgress } from "@/assessment/api/sessions.api";
import { sessionsKeys } from "@/assessment/api/templates-hooks";
import { uploadAvatar, updateUserAvatar } from "@/users/api/avatar.api";
import { useQueryClient } from "@tanstack/react-query";
import { usersKeys } from "@/users/api/users-query-keys";
import { Progress } from "@/components/ui/progress";

// ----------------------------------
// Utility components
// ----------------------------------
function UserStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const norm = status.toUpperCase();
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE: {
      label: "فعال",
      cls: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    },
    SUSPENDED: {
      label: "معلق",
      cls: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    },
    DISABLED: {
      label: "غیرفعال",
      cls: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
    },
  };
  const meta = map[norm] || {
    label: status,
    cls: "bg-muted text-muted-foreground border-muted-foreground/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[10px] font-medium",
        meta.cls
      )}>
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            "absolute inset-0 rounded-full",
            norm === "ACTIVE"
              ? "bg-emerald-500"
              : norm === "SUSPENDED"
              ? "bg-amber-500"
              : norm === "DISABLED"
              ? "bg-rose-500"
              : "bg-muted-foreground"
          )}
        />
      </span>
      {meta.label}
    </span>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}) {
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

// (Removed roles selector UI)

// Colorful progress status chip for user progress
function ProgressStatusChip({
  status,
  percent,
}: {
  status?: string;
  percent?: number;
}) {
  if (!status) return null;
  const map: Record<
    string,
    { cls: string; icon: React.ReactNode; label: string }
  > = {
    COMPLETED: {
      cls: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "تکمیل شد",
    },
    IN_PROGRESS: {
      cls: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "در حال انجام",
    },
    NOT_STARTED: {
      cls: "bg-muted text-muted-foreground border-muted-foreground/30 dark:bg-muted/30",
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      label: "شروع نشده",
    },
    NO_QUESTIONS: {
      cls: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700",
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      label: "بدون سوال",
    },
  };
  const meta = map[status] || {
    cls: "bg-muted text-muted-foreground border-muted-foreground/30",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    label: "—",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        meta.cls
      )}>
      {meta.icon}
      <span>{meta.label}</span>
      <span className="opacity-60 ltr:font-mono">{percent ?? 0}%</span>
    </span>
  );
}

export default function DashboardLandingPage() {
  const { userId } = useAuthSession();
  const userQuery = useUser(userId);
  const qc = useQueryClient();
  const orgCtx = useOrgState();
  const router = useRouter();
  const { setActiveSessionId, setActivePerspective, availablePerspectives } =
    useAssessmentUserSessions();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const loading = userQuery.isLoading || orgCtx.loading;
  const user = userQuery.data as any;
  const orgs = orgCtx.organizations || [];
  const userSessionsQ = useUserSessions(userId, { pageSize: 12 });
  const sessions = (userSessionsQ.data as any)?.data || [];

  // Derive stats
  const totalOrgs = orgs.length;
  const totalUserSessions = Array.isArray(sessions) ? sessions.length : 0;
  const inProgressCount = sessions.filter(
    (s: any) => s.state === "IN_PROGRESS"
  ).length;
  const completedCount = sessions.filter(
    (s: any) => s.state === "COMPLETED"
  ).length;
  // Active organization and role
  const activeOrg =
    orgs.find((o: any) => o.id === orgCtx.activeOrganizationId) || orgs[0];
  const rolesCount = orgCtx.activeRole ? 1 : 0;

  // Progress-based completion (per user, not just session.state)
  const progressQs = useQueries({
    queries: (Array.isArray(sessions) ? sessions : []).map((s: any) => ({
      queryKey: sessionsKeys.progressBySessionUser(
        s.id,
        userId!,
        undefined,
        undefined
      ),
      queryFn: () => getUserProgress({ sessionId: s.id, userId: userId! }),
      enabled: !!userId && !!s?.id,
      staleTime: 30 * 1000,
    })),
  });
  const anyProgressLoading = !mounted || progressQs.some((q) => q.isLoading);
  const progressById: Record<
    number,
    { percent?: number; status?: string } | null
  > = {};
  (Array.isArray(sessions) ? sessions : []).forEach((s: any, i: number) => {
    progressById[s.id] = (progressQs[i] && (progressQs[i].data as any)) || null;
  });
  const progressData = progressQs.map((q) => q.data).filter(Boolean) as Array<{
    percent: number;
    status: string;
  }>;
  const completedByProgress = progressData.filter(
    (p) => p.status === "COMPLETED"
  ).length;
  const avgPercent = progressData.length
    ? Math.round(
        progressData.reduce((sum, p) => sum + (p.percent ?? 0), 0) /
          progressData.length
      )
    : 0;

  const createdAt = user?.createdAt;
  let createdAtPretty: string | null = null;
  if (createdAt) {
    try {
      createdAtPretty = formatJalali(parseJalali(createdAt));
    } catch {
      createdAtPretty = null;
    }
  }

  const avatarUrl = user?.avatarUrl || user?.avatar;
  const [localAvatar, setLocalAvatar] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  function onAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic validations
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است.");
      e.target.value = "";
      return;
    }
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`حجم تصویر نباید بیشتر از ${maxMB} مگابایت باشد.`);
      e.target.value = "";
      return;
    }
    // Preview locally
    const url = URL.createObjectURL(file);
    setLocalAvatar(url);
    toast.info(
      "پیش‌نمایش تصویر اعمال شد. برای ذخیره دائم، اتصال به سرور لازم است."
    );
    // Upload & persist
    (async () => {
      try {
        const asset = await uploadAvatar(file);
        if (userId) {
          await updateUserAvatar(userId, asset.id);
          toast.success("تصویر پروفایل با موفقیت ذخیره شد.");
          await qc.invalidateQueries({ queryKey: usersKeys.byId(userId) });
        }
      } catch (err: any) {
        toast.error(err?.message || "خطا در آپلود تصویر");
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

  // Active organization from context (fallback already computed above)
  const updatedAt = user?.updatedAt || user?.lastUpdatedAt;
  let updatedAtPretty: string | null = null;
  if (updatedAt) {
    try {
      updatedAtPretty = formatJalali(parseJalali(updatedAt), true);
    } catch {
      updatedAtPretty = null;
    }
  }

  return (
    <div className=" pb-10 flex flex-col gap-6" dir="rtl">
      {/* Header */}
      <Panel>
        <PanelHeader className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative">
              <Avatar
                onClick={onAvatarClick}
                className="h-20 w-20 rounded-2xl border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/40 transition">
                {(localAvatar || avatarUrl) && (
                  <AvatarImage src={localAvatar || avatarUrl} alt={fullName} />
                )}
                <AvatarFallback className="rounded-2xl text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Subtle camera hint */}
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
                {mounted && orgCtx.activeRole && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border/60">
                    {orgCtx.activeRoleSource === "platform" ? (
                      <Crown className="h-3 w-3" />
                    ) : (
                      <Building2 className="h-3 w-3" />
                    )}
                    {orgCtx.activeRoleSource === "platform"
                      ? PlatformRoleEnum.t(orgCtx.activeRole as any)
                      : OrgRoleEnum.t(orgCtx.activeRole as any)}
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
                {/* Removed roles list UI per request */}
              </PanelDescription>
            </div>
          </div>
        </PanelHeader>
        <PanelContent className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
            <StatItem
              icon={Building2}
              label="تعداد سازمان‌ها"
              value={totalOrgs}
              loading={!mounted || orgCtx.loading}
            />
            <StatItem
              icon={Layers}
              label="نقش‌های متمایز"
              value={rolesCount}
              loading={!mounted || orgCtx.loading}
            />
            <StatItem
              icon={Users2}
              label="آزمون‌های من"
              value={totalUserSessions}
              loading={!mounted || userSessionsQ.isLoading}
            />
            <StatItem
              icon={Crown}
              label="تکمیل شده / درصد"
              value={`${completedByProgress} (${avgPercent}%)`}
              loading={!mounted || userSessionsQ.isLoading}
            />
          </div>
        </PanelContent>
      </Panel>
      {/* My Sessions Panel */}
      <Panel>
        <PanelHeader>
          <PanelTitle className="text-sm inline-flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            آزمون‌های من
          </PanelTitle>
          <PanelDescription>
            جلسات ارزیابی اختصاص داده شده به شما
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="flex flex-col gap-4 text-[12px] leading-5">
          <div className="grid gap-2 grid-cols-1">
            {!mounted || userSessionsQ.isLoading ? (
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/60 bg-background/40 p-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-40" />
                    <div className="ms-auto">
                      <Skeleton className="h-8 w-24 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : sessions.length === 0 ? (
              <div className="col-span-full text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-lg p-8">
                فعلاً آزمونی برای شما ثبت نشده است.
              </div>
            ) : (
              sessions.map((s: any, i: number) => (
                <SessionMiniCard
                  key={s.id}
                  s={s}
                  progress={progressById[s.id]}
                  progressLoading={anyProgressLoading}
                />
              ))
            )}
          </div>
        </PanelContent>
      </Panel>
    </div>
  );
}

function SessionMiniCard({
  s,
  progress,
  progressLoading,
}: {
  s: any;
  progress: { percent?: number; status?: string } | null | undefined;
  progressLoading: boolean;
}) {
  const qc = useSessionQuestionCount(s.id);
  const { setActiveSessionId, setActivePerspective, availablePerspectives } =
    useAssessmentUserSessions();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  let startStr: string | null = null;
  let endStr: string | null = null;
  try {
    // Date-only (no time)
    startStr = formatJalali(parseJalali(s.startAt));
    endStr = formatJalali(parseJalali(s.endAt));
  } catch {}
  const rel = formatJalaliRelative(s.startAt, { futureMode: "relative" });
  const totalQ = qc.data?.total ?? null;
  const go = () => {
    setActiveSessionId(s.id);
    // Pick a default perspective if provider has none yet
    if ((availablePerspectives?.length ?? 0) > 0) {
      setActivePerspective(availablePerspectives![0] as any);
    }
    router.push("/dashboard/tests/take");
  };
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 dark:bg-muted/40 px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* Mobile CTA at top-left */}

        {/* Profession/Icon lead */}
        <div className="hidden sm:flex items-center justify-center h-8 w-8 rounded-md bg-muted text-muted-foreground">
          <Briefcase className="h-4 w-4" />
        </div>
        <div className="min-w-0 w-full flex items-center justify-between gap-2 flex-1 basis-[300px]">
          <span
            className="text-sm font-medium truncate max-w-[360px]"
            title={s.name}>
            {s.name}
          </span>
          <div className="flex justify-end lg:hidden w-fit">
            <Button size="sm" className="h-8 text-[11px]" onClick={go}>
              ورود به آزمون
            </Button>
          </div>
        </div>
        {/* State + Progress */}
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-muted-foreground">وضعیت</Label>
          <Badge
            variant={
              s.state === "CANCELLED"
                ? "destructive"
                : s.state === "COMPLETED"
                ? "secondary"
                : "outline"
            }
            className="text-[10px] rounded-full">
            {SessionStateEnum.t(s.state)}
          </Badge>
          {progressLoading ? (
            <Skeleton className="h-4 w-20 rounded" />
          ) : progress ? (
            <ProgressStatusChip
              status={progress.status}
              percent={progress.percent}
            />
          ) : null}
        </div>
        {/* Dates */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-muted-foreground">
          <Label className="text-[10px] text-muted-foreground">زمان‌بندی</Label>
          <Calendar className="h-3.5 w-3.5" />
          <span>{startStr || (s.startAt?.split("T")[0] ?? s.startAt)}</span>
          <span className="opacity-60">←</span>
          <span>{endStr || (s.endAt?.split("T")[0] ?? s.endAt)}</span>
          {mounted && (
            <span className="ltr:font-mono opacity-60" title={rel}>
              {rel}
            </span>
          )}
        </div>
        {/* IDs and counts */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[10px]">
            <Hash className="h-3 w-3" /> #{s.id}
          </span>
          {qc.isLoading ? (
            <Skeleton className="h-4 w-10 rounded" />
          ) : totalQ != null ? (
            <span className="inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[10px]">
              <Layers className="h-3 w-3" /> سوال: {totalQ}
            </span>
          ) : null}
        </div>
        {/* CTA (desktop) */}
        <div className="ms-auto hidden lg:block">
          <Button size="sm" className="h-8 text-[11px]" onClick={go}>
            ورود به آزمون
          </Button>
        </div>
      </div>
      {/* Tiny progress bar */}
      <div className="mt-1">
        {progressLoading ? (
          <Skeleton className="h-1.5 w-full rounded" />
        ) : progress ? (
          <Progress
            value={progress.percent ?? 0}
            className={cn(
              "h-1.5",
              progress.status === "COMPLETED"
                ? "[&_[data-slot=progress-indicator]]:bg-emerald-500"
                : progress.status === "IN_PROGRESS"
                ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
                : progress.status === "NOT_STARTED"
                ? "[&_[data-slot=progress-indicator]]:bg-muted-foreground/50"
                : "[&_[data-slot=progress-indicator]]:bg-slate-400"
            )}
          />
        ) : null}
      </div>
      {/* Mobile dates row */}
      <div className="mt-1 lg:hidden flex items-center gap-1 text-[11px] text-muted-foreground">
        <Label className="text-[10px] text-muted-foreground">زمان‌بندی</Label>
        <Calendar className="h-3.5 w-3.5" />
        <span>{startStr || (s.startAt?.split("T")[0] ?? s.startAt)}</span>
        <span className="opacity-60">←</span>
        <span>{endStr || (s.endAt?.split("T")[0] ?? s.endAt)}</span>
        {mounted && (
          <span className="ltr:font-mono opacity-60" title={rel}>
            {rel}
          </span>
        )}
      </div>
    </div>
  );
}
