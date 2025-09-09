/**
 * Cache helpers for Team Membership domain.
 */
import { QueryClient } from "@tanstack/react-query";
import { teamMembershipKeys } from "./team-membership-query-keys";
import { listTeamMembers } from "./team-membership.api";
import type { TeamMembershipArray } from "../types/team-membership.types";

export function invalidateAllTeamMembers(
  qc: QueryClient,
  orgId: number,
  teamId: number
) {
  return qc.invalidateQueries({
    queryKey: teamMembershipKeys.team(orgId, teamId),
  });
}

export function invalidateTeamMemberLists(
  qc: QueryClient,
  orgId: number,
  teamId: number
) {
  return qc.invalidateQueries({
    queryKey: teamMembershipKeys.lists(orgId, teamId),
  });
}

export function prefetchTeamMembers(
  qc: QueryClient,
  orgId: number,
  teamId: number,
  params?: { page?: number; pageSize?: number }
) {
  return qc.prefetchQuery({
    queryKey: teamMembershipKeys.list(orgId, teamId, params),
    queryFn: () => listTeamMembers(orgId, teamId, params),
  });
}

/** Optimistic list insert */
export function optimisticAddMemberToLists(
  qc: QueryClient,
  orgId: number,
  teamId: number,
  newItem: TeamMembershipArray[number]
) {
  const queries = qc
    .getQueryCache()
    .findAll({
      queryKey: teamMembershipKeys.lists(orgId, teamId),
      exact: false,
    });
  queries.forEach((q) => {
    const data = q.state.data as any;
    if (!data) return;
    // Expecting plain array for now (API returns TeamMembershipArray)
    if (Array.isArray(data)) {
      q.setData([newItem, ...data]);
    } else if (Array.isArray(data?.data)) {
      q.setData({ ...data, data: [newItem, ...data.data] });
    }
  });
}

/** Optimistic list remove */
export function optimisticRemoveMemberFromLists(
  qc: QueryClient,
  orgId: number,
  teamId: number,
  membershipId: number
) {
  const queries = qc
    .getQueryCache()
    .findAll({
      queryKey: teamMembershipKeys.lists(orgId, teamId),
      exact: false,
    });
  queries.forEach((q) => {
    const data = q.state.data as any;
    if (!data) return;
    if (Array.isArray(data)) {
      q.setData(data.filter((m) => m.id !== membershipId));
    } else if (Array.isArray(data?.data)) {
      q.setData({
        ...data,
        data: data.data.filter((m: any) => m.id !== membershipId),
      });
    }
  });
}
