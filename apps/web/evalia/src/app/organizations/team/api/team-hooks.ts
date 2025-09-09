/** React Query hooks for Teams */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  restoreTeam,
} from "./team.api";
import { teamKeys } from "./team-query-keys";
import {
  invalidateAllTeams,
  invalidateTeamDetail,
  invalidateTeamLists,
  prefetchTeam,
  prefetchTeamList,
  optimisticAddTeamToLists,
  optimisticRemoveTeamFromLists,
} from "./team-cache";
import type { CreateTeamInput, UpdateTeamInput } from "../types/team.types";

const STALE_LIST = 60 * 1000;
const STALE_DETAIL = 2 * 60 * 1000;

export function useTeams(
  orgId: number,
  params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    includeDeleted?: boolean;
  }
) {
  return useQuery({
    queryKey: teamKeys.list(orgId, params),
    queryFn: () => listTeams(orgId, params),
    staleTime: STALE_LIST,
  });
}

export function useTeam(orgId: number, teamId: number | null) {
  return useQuery({
    queryKey: teamId
      ? teamKeys.byId(orgId, teamId)
      : ["organizations", orgId, "teams", "detail", "disabled"],
    queryFn: async () => {
      if (!teamId) throw new Error("No team id");
      return getTeam(orgId, teamId);
    },
    enabled: !!teamId,
    staleTime: STALE_DETAIL,
  });
}

export function usePrefetchTeamList() {
  const qc = useQueryClient();
  return (
    orgId: number,
    params?: {
      page?: number;
      pageSize?: number;
      q?: string;
      includeDeleted?: boolean;
    }
  ) => prefetchTeamList(qc, orgId, params);
}

export function usePrefetchTeam() {
  const qc = useQueryClient();
  return (orgId: number, teamId: number) => prefetchTeam(qc, orgId, teamId);
}

export function useCreateTeam(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeamInput) => createTeam(orgId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: teamKeys.lists(orgId) });
      const temp = {
        id: Math.floor(Math.random() * 1e9) * -1,
        organizationId: orgId,
        name: input.name,
        slug: input.slug || input.name.toLowerCase().replace(/\s+/g, "-"),
        description: input.description || null,
        createdAt: new Date().toISOString(),
      } as any;
      optimisticAddTeamToLists(qc, orgId, temp);
      return { tempId: temp.id };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.tempId) optimisticRemoveTeamFromLists(qc, orgId, ctx.tempId);
    },
    onSuccess: () => {
      invalidateTeamLists(qc, orgId);
    },
  });
}

export function useUpdateTeam(orgId: number, teamId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTeamInput) => updateTeam(orgId, teamId, input),
    onSuccess: (updated) => {
      // Update detail cache and invalidate lists
      qc.setQueryData(teamKeys.byId(orgId, teamId), updated);
      invalidateTeamLists(qc, orgId);
    },
  });
}

export function useDeleteTeam(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => deleteTeam(orgId, teamId),
    onMutate: async (teamId) => {
      await qc.cancelQueries({ queryKey: teamKeys.lists(orgId) });
      optimisticRemoveTeamFromLists(qc, orgId, teamId);
      return { teamId };
    },
    onError: () => {
      // simplest recovery
      invalidateTeamLists(qc, orgId);
    },
    onSuccess: () => {
      invalidateTeamLists(qc, orgId);
    },
  });
}

export function useRestoreTeam(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teamId: number) => restoreTeam(orgId, teamId),
    onSuccess: () => {
      invalidateAllTeams(qc, orgId);
    },
  });
}
