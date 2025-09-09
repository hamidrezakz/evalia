/**
 * React Query hooks for Team Memberships.
 * Mirrors existing style in users-hooks with hierarchical keys and optimistic updates.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTeamMembers,
  addTeamMember,
  removeTeamMember,
} from "./team-membership.api";
import { teamMembershipKeys } from "./team-membership-query-keys";
import type {
  TeamMembershipArray,
  TeamMembership,
  AddTeamMemberInput,
} from "../types/team-membership.types";
import {
  optimisticAddMemberToLists,
  optimisticRemoveMemberFromLists,
  prefetchTeamMembers,
  invalidateAllTeamMembers,
} from "./team-membership-cache";

const STALE_TEAM_MEMBERS = 60 * 1000; // 1m

export function useTeamMembers(
  orgId: number,
  teamId: number,
  params?: { page?: number; pageSize?: number }
) {
  return useQuery<TeamMembershipArray>({
    queryKey: teamMembershipKeys.list(orgId, teamId, params),
    queryFn: () => listTeamMembers(orgId, teamId, params),
    staleTime: STALE_TEAM_MEMBERS,
    // keepPreviousData in v5 is default via structural sharing; explicit optional
  });
}

export function usePrefetchTeamMembers() {
  const qc = useQueryClient();
  return (
    orgId: number,
    teamId: number,
    params?: { page?: number; pageSize?: number }
  ) => prefetchTeamMembers(qc, orgId, teamId, params);
}

export function useAddTeamMember(orgId: number, teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddTeamMemberInput) =>
      addTeamMember(orgId, teamId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({
        queryKey: teamMembershipKeys.lists(orgId, teamId),
      });
      // Optimistically prepend a temporary membership item
      const tempItem: TeamMembership = {
        id: Math.floor(Math.random() * 1e9) * -1, // negative temp id
        teamId,
        userId: input.userId,
        createdAt: new Date().toISOString(),
      } as TeamMembership;
      optimisticAddMemberToLists(qc, orgId, teamId, tempItem);
      return { tempId: tempItem.id };
    },
    onError: (_e, _vars, ctx) => {
      // rollback by removing temp id
      if (ctx?.tempId)
        optimisticRemoveMemberFromLists(qc, orgId, teamId, ctx.tempId);
    },
    onSuccess: (created) => {
      // replace temp with real (simplify by invalidating)
      invalidateAllTeamMembers(qc, orgId, teamId);
    },
  });
}

export function useRemoveTeamMember(orgId: number, teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) =>
      removeTeamMember(orgId, teamId, membershipId),
    onMutate: async (membershipId) => {
      await qc.cancelQueries({
        queryKey: teamMembershipKeys.lists(orgId, teamId),
      });
      optimisticRemoveMemberFromLists(qc, orgId, teamId, membershipId);
      return { removedId: membershipId };
    },
    onError: (_e, _vars, ctx) => {
      // simplest recovery: refetch lists
      invalidateAllTeamMembers(qc, orgId, teamId);
    },
    onSuccess: () => {
      invalidateAllTeamMembers(qc, orgId, teamId);
    },
  });
}
