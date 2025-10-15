"use client";
import * as React from "react";
import { Briefcase, Calendar, Layers, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { SessionStateBadge } from "@/components/status-badges/SessionStateBadge";
import { AssignmentProgressBadge } from "@/components/status-badges/AssignmentProgressBadge";
import { useSessionQuestionCount } from "@/assessment/api/sessions-hooks";
import { useOrgState } from "@/organizations/organization/context";
import { useAssessmentUserSessions } from "@/assessment/context/assessment-user-sessions";
import { useRouter } from "next/navigation";
import {
  parseJalali,
  formatJalali,
  formatJalaliRelative,
} from "@/lib/jalali-date";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SessionUserCardProps {
  session: any; // TODO: introduce strong typing later
  progress: { percent?: number; status?: string } | null | undefined;
  progressLoading: boolean;
  className?: string;
  onJoinOverride?: (sessionId: number) => Promise<void> | void;
}

export function SessionUserCard({
  session,
  progress,
  progressLoading,
  className,
  onJoinOverride,
}: SessionUserCardProps) {
  const orgCtx = useOrgState();
  const activeOrgId = orgCtx.activeOrganizationId || null;
  const qc = useSessionQuestionCount(activeOrgId, session.id);
  const { setActiveSessionId, setActivePerspective, availablePerspectives } =
    useAssessmentUserSessions();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  let startStr: string | null = null;
  let endStr: string | null = null;
  try {
    startStr = formatJalali(parseJalali(session.startAt));
    endStr = formatJalali(parseJalali(session.endAt));
  } catch {}
  const rel = formatJalaliRelative(session.startAt, { futureMode: "relative" });
  const assignedAt: string | null = (session as any)?.assignedAt || null;
  let assignedPretty: string | null = null;
  let assignedRel: string | null = null;
  if (assignedAt) {
    try {
      assignedPretty = formatJalali(parseJalali(assignedAt));
      assignedRel = formatJalaliRelative(assignedAt, {
        futureMode: "relative",
      });
    } catch {}
  }
  const totalQ = qc.data?.total ?? null;
  const [joining, setJoining] = React.useState(false);
  const go = async () => {
    if (joining) return;
    setJoining(true);
    try {
      if (onJoinOverride) {
        await onJoinOverride(session.id);
        // Override flow stays on the same page – release loading after it resolves
        setJoining(false);
      } else {
        setActiveSessionId(session.id);
        if ((availablePerspectives?.length ?? 0) > 0) {
          setActivePerspective(availablePerspectives![0] as any);
        }
        // Navigate to the test page; keep loading until unmount by route change
        router.push("/dashboard/tests/take");
      }
    } catch {
      // In case of any error, release loading to allow retry
      setJoining(false);
    }
  };
  return (
    <div className={cn("card-surface px-3 py-3", className)} dir="rtl">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 w-full flex items-center justify-between gap-2 flex-1 basis-[300px]">
          <span
            className="inline-flex w-full sm:w-fit items-center gap-2 text-sm font-medium truncate max-w-[420px]"
            title={session.name}>
            <Briefcase className="h-4 w-4 text-primary/70 shrink-0" />
            <span className="truncate w-full max-w-[300px]">
              {session.name}
            </span>
            <span className="flex justify-end">
              <SessionStateBadge state={session.state} size="xs" tone="soft" />
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {progressLoading ? (
            <Skeleton className="h-4 w-16 rounded" />
          ) : progress ? (
            <AssignmentProgressBadge
              status={progress.status as any}
              percent={progress.percent}
              size="xs"
              tone="soft"
              showPercent
            />
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {qc.isLoading ? (
            <Skeleton className="h-4 w-10 rounded" />
          ) : totalQ != null ? (
            <span className="inline-flex items-center gap-1 rounded border border-border/60 px-1.5 py-0.5 text-[10px]">
              <Layers className="h-3 w-3" /> سوال: {totalQ}
            </span>
          ) : null}
        </div>
      </div>
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
      <div className="mt-1 flex flex-col gap-1 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <Label className="text-[10px] text-muted-foreground">
            زمانبندی آزمون:
          </Label>
          <span>
            {startStr || (session.startAt?.split("T")[0] ?? session.startAt)}
          </span>
          <span className="opacity-60">←</span>
          <span>
            {endStr || (session.endAt?.split("T")[0] ?? session.endAt)}
          </span>
          {mounted && (
            <span className="ltr:font-mono opacity-60" title={rel}>
              {rel}
            </span>
          )}
        </div>
        {assignedPretty && (
          <div className="flex items-center gap-1">
            <Label className="text-[10px] text-muted-foreground">تخصیص:</Label>
            <span className="font-medium" title={assignedPretty}>
              {assignedPretty}
            </span>
            {assignedRel && (
              <span className="text-muted-foreground/70" title={assignedPretty}>
                ({assignedRel})
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 flex w-fit justify-start">
        <Button
          size="sm"
          className="h-8 text-[11px] min-w-[120px]"
          onClick={go}
          isLoading={joining}
          icon={<PlayCircle className="h-3.5 w-3.5" />}
          iconPosition="right">
          ورود به آزمون
        </Button>
      </div>
    </div>
  );
}

// Skeleton for a single card matching layout
export function SessionUserCardSkeleton() {
  return (
    <div
      className="card-surface px-3 py-3 animate-pulse flex flex-col gap-2"
      dir="rtl">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 w-full flex items-center justify-between gap-2 flex-1 basis-[300px]">
          <div className="inline-flex w-full items-center gap-2 max-w-[420px]">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-12 ms-auto" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-10 rounded" />
        </div>
      </div>
      <Skeleton className="h-1.5 w-full rounded" />
      <div className="flex flex-col gap-1 text-[10px]">
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="mt-2">
        <Skeleton className="h-8 w-28 rounded" />
      </div>
    </div>
  );
}
