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
import { Skeleton } from "@/components/ui/skeleton";
import {
  parseJalali,
  formatJalali,
  formatJalaliRelative,
} from "@/lib/jalali-date";
import { Layers } from "lucide-react";
import { useUserSessions } from "@/assessment/api/sessions-hooks";
import { SessionStateEnum } from "@/lib/enums";
import { useAssessmentUserSessions } from "@/assessment/context/assessment-user-sessions";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { getUserProgress } from "@/assessment/api/sessions.api";
import { sessionsKeys } from "@/assessment/api/sessions-hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  DashboardHeaderSkeleton,
  SessionUserCardPrettySkeleton,
} from "./components/dashboard-skeletons";
import { formatFa } from "@/lib/metrics";
import { DashboardUserHeaderPanel } from "./components/DashboardUserHeaderPanel";
import { SessionUserCard } from "./components/SessionUserCard";

// Header stats handled inside DashboardUserHeaderPanel

// (Removed roles selector UI)

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
  // Determine active organization early (before hooks needing orgId)
  const activeOrg =
    orgs.find((o: any) => o.id === orgCtx.activeOrganizationId) || orgs[0];
  // Active organization id (explicit scoping for multi-tenant queries)
  const activeOrgId = orgCtx.activeOrganizationId || activeOrg?.id || null;
  const userSessionsQ = useUserSessions(activeOrgId, userId, { pageSize: 12 });
  const sessions = (userSessionsQ.data as any)?.data || [];
  const sessionsLoadingDetailed =
    !mounted ||
    userSessionsQ.isLoading ||
    (userSessionsQ as any).isFetching ||
    !userSessionsQ.data; // treat no data yet as loading to avoid premature zero-state
  const sessionsReady = !sessionsLoadingDetailed;

  // Derive stats
  const totalOrgs = orgs.length;
  const totalUserSessions = Array.isArray(sessions) ? sessions.length : 0;
  const inProgressCount = sessions.filter(
    (s: any) => s.state === "IN_PROGRESS"
  ).length;
  const completedCount = sessions.filter(
    (s: any) => s.state === "COMPLETED"
  ).length;
  // Active organization and role (activeOrg already computed above)
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
      queryFn: () =>
        getUserProgress(
          { sessionId: s.id, userId: userId! },
          activeOrgId || undefined
        ),
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

  // Header details handled in DashboardUserHeaderPanel component

  return (
    <div className=" pb-10 flex flex-col gap-6" dir="rtl">
      {loading ? (
        <DashboardHeaderSkeleton />
      ) : (
        <DashboardUserHeaderPanel
          user={user}
          userId={typeof userId === "number" ? userId : null}
          mounted={mounted}
          activeOrg={activeOrg}
          activeRole={orgCtx.activeRole || null}
          activeRoleSource={orgCtx.activeRoleSource || null}
          totalOrgs={totalOrgs}
          rolesCount={rolesCount}
          totalUserSessions={totalUserSessions}
          completedByProgress={completedByProgress}
          avgPercent={avgPercent}
          loading={loading}
          sessionsLoading={userSessionsQ.isLoading}
          orgLoading={orgCtx.loading}
        />
      )}
      {/* My Sessions Panel */}
      {sessionsLoadingDetailed && loading ? (
        <Panel>
          <PanelContent className="flex flex-col gap-4 text-[12px] leading-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SessionUserCardPrettySkeleton key={i} />
              ))}
            </div>
          </PanelContent>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader>
            <PanelTitle className="text-sm inline-flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              آزمون‌های من
              {sessionsReady &&
              Array.isArray(sessions) &&
              sessions.length > 0 ? (
                <span className="text-[11px] font-normal text-muted-foreground">
                  ({formatFa(sessions.length)} آزمون)
                </span>
              ) : null}
            </PanelTitle>
            {sessionsReady ? (
              <PanelDescription>
                {Array.isArray(sessions) && sessions.length === 0
                  ? "آزمونی تا این لحظه برای شما ثبت / اختصاص نیافته است."
                  : "جلسات ارزیابی اختصاص داده شده به شما"}
              </PanelDescription>
            ) : null}
          </PanelHeader>
          <PanelContent className="flex flex-col gap-4 text-[12px] leading-5">
            <div className="flex flex-col gap-3">
              {sessionsReady && sessions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-lg p-8">
                  فعلاً آزمونی برای شما ثبت نشده است.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {sessions.map((s: any) => (
                    <SessionUserCard
                      key={s.id}
                      session={s}
                      progress={progressById[s.id]}
                      progressLoading={anyProgressLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </PanelContent>
        </Panel>
      )}
    </div>
  );
}
