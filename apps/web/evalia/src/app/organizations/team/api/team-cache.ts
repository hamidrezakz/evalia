/** Cache helpers for Team domain */
import { QueryClient } from "@tanstack/react-query";
import { teamKeys } from "./team-query-keys";
import { listTeams, getTeam } from "./team.api";

export function invalidateAllTeams(qc: QueryClient, orgId: number) {
  return qc.invalidateQueries({ queryKey: teamKeys.all(orgId) });
}

export function invalidateTeamLists(qc: QueryClient, orgId: number) {
  return qc.invalidateQueries({ queryKey: teamKeys.lists(orgId) });
}

export function invalidateTeamDetail(
  qc: QueryClient,
  orgId: number,
  teamId: number
) {
  return qc.invalidateQueries({ queryKey: teamKeys.byId(orgId, teamId) });
}

export function prefetchTeamList(
  qc: QueryClient,
  orgId: number,
  params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    includeDeleted?: boolean;
  }
) {
  return qc.prefetchQuery({
    queryKey: teamKeys.list(orgId, params),
    queryFn: () => listTeams(orgId, params),
  });
}

export function prefetchTeam(qc: QueryClient, orgId: number, teamId: number) {
  return qc.prefetchQuery({
    queryKey: teamKeys.byId(orgId, teamId),
    queryFn: () => getTeam(orgId, teamId),
  });
}

export function optimisticAddTeamToLists(
  qc: QueryClient,
  orgId: number,
  newTeam: any
) {
  const queries = qc
    .getQueryCache()
    .findAll({ queryKey: teamKeys.lists(orgId), exact: false });
  queries.forEach((q) => {
    const data = q.state.data as any;
    if (!data) return;
    if (Array.isArray(data)) q.setData([newTeam, ...data]);
    else if (Array.isArray(data?.data))
      q.setData({ ...data, data: [newTeam, ...data.data] });
  });
}

export function optimisticRemoveTeamFromLists(
  qc: QueryClient,
  orgId: number,
  teamId: number
) {
  const queries = qc
    .getQueryCache()
    .findAll({ queryKey: teamKeys.lists(orgId), exact: false });
  queries.forEach((q) => {
    const data = q.state.data as any;
    if (!data) return;
    if (Array.isArray(data)) q.setData(data.filter((t) => t.id !== teamId));
    else if (Array.isArray(data?.data))
      q.setData({
        ...data,
        data: data.data.filter((t: any) => t.id !== teamId),
      });
  });
}
