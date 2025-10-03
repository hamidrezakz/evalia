import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addMembersToTeam,
  listTeamMembers,
  mergeMembersIntoCache,
  removeMemberFromTeam,
} from "./team-members.api";
import { teamKeys } from "./team-query-keys";

export function useTeamMembers(
  orgId: number,
  teamId: number | null,
  enabled = true
) {
  return useQuery({
    queryKey: teamId
      ? teamKeys.members(orgId, teamId)
      : ["teams", orgId, "members", "disabled"],
    queryFn: () => {
      if (!teamId) throw new Error("No teamId");
      return listTeamMembers(orgId, teamId);
    },
    enabled: !!teamId && enabled,
    staleTime: 30 * 1000,
  });
}

export function useAddMembersToTeam(orgId: number, teamId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userIds: number[]) => {
      if (!teamId) return Promise.reject(new Error("No teamId"));
      return addMembersToTeam(orgId, teamId, userIds);
    },
    onSuccess: (members, _vars) => {
      if (teamId) mergeMembersIntoCache(qc, orgId, teamId, members);
    },
  });
}

export function useRemoveTeamMember(orgId: number, teamId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) => {
      if (!teamId) return Promise.reject(new Error("No teamId"));
      return removeMemberFromTeam(orgId, teamId, membershipId);
    },
    onMutate: async (membershipId: number) => {
      if (!teamId) return;
      const key = teamKeys.members(orgId, teamId);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<any[]>(key) || [];
      qc.setQueryData(
        key,
        prev.filter((m) => m.id !== membershipId)
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (!teamId) return;
      if (ctx?.prev) {
        const key = teamKeys.members(orgId, teamId);
        qc.setQueryData(key, ctx.prev);
      }
    },
    onSettled: () => {
      if (teamId) {
        const key = teamKeys.members(orgId, teamId);
        qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}
