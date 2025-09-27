import * as React from "react";

import { useAssignmentsDetailed } from "@/assessment/api/templates-hooks";

export function useSessionAssignmentGroups(sessionId: number | null) {
  const { data: assignments, isLoading } = useAssignmentsDetailed(sessionId);

  const normalized = React.useMemo(
    () => (Array.isArray(assignments) ? (assignments as any[]) : []),
    [assignments]
  );

  const selfItems = React.useMemo(
    () => normalized.filter((a) => (a.perspective as any) === "SELF"),
    [normalized]
  );

  const facilitatorGroups = React.useMemo(() => {
    const fac = normalized.filter(
      (a) => (a.perspective as any) === "FACILITATOR"
    );
    const map = new Map<number, { respondentName: string; items: any[] }>();

    for (const a of fac) {
      const rid = (a.respondentUserId ?? a.userId ?? 0) as number;
      const rname =
        a.respondent?.fullName ||
        a.respondent?.name ||
        a.user?.fullName ||
        a.user?.name ||
        a.respondent?.email ||
        a.user?.email ||
        `کاربر #${rid}`;

      if (!map.has(rid)) {
        map.set(rid, { respondentName: rname, items: [] });
      }

      map.get(rid)!.items.push(a);
    }

    return Array.from(map.entries()).map(([respondentUserId, value]) => ({
      respondentUserId,
      respondentName: value.respondentName,
      items: value.items,
    }));
  }, [normalized]);

  return { isLoading, assignments: normalized, selfItems, facilitatorGroups };
}
