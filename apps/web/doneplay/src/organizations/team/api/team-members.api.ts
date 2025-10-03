import { apiRequest, unwrap } from "@/lib/api.client";
import { z } from "zod";
import { teamKeys } from "./team-query-keys";
import { QueryClient } from "@tanstack/react-query";

// Basic member shape (align with backend minimal view)
export const TeamMemberSchema = z.object({
  id: z.number(),
  userId: z.number(),
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});
export const TeamMemberArraySchema = z.array(TeamMemberSchema);
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export async function listTeamMembers(orgId: number, teamId: number) {
  const res = await apiRequest<TeamMember[]>(
    `/organizations/${orgId}/teams/${teamId}/members`,
    null,
    TeamMemberArraySchema
  );
  return unwrap(res);
}

export async function addMembersToTeam(
  orgId: number,
  teamId: number,
  userIds: number[]
) {
  // Backend expects single { userId } per POST -> loop sequentially
  const AddedSchema = TeamMemberSchema.or(
    z.object({ id: z.number().optional(), userId: z.number() })
  );
  const created: TeamMember[] = [];
  for (const userId of userIds) {
    try {
      const SinglePayload = z.object({ userId: z.number() });
      const res = await apiRequest<unknown, { userId: number }>(
        `/organizations/${orgId}/teams/${teamId}/members`,
        SinglePayload,
        AddedSchema,
        { method: "POST", body: { userId } }
      );
      const unwrapped = unwrap(res) as any;
      if (unwrapped && typeof unwrapped === "object") {
        created.push({
          id: unwrapped.id ?? Date.now(),
          userId: unwrapped.userId,
          fullName: unwrapped.fullName ?? null,
          email: unwrapped.email ?? null,
          phone: (unwrapped as any).phone ?? null,
          avatar: (unwrapped as any).avatar ?? null,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      const code = e?.response?.data?.message?.code || e?.message?.code;
      if (code === "DUPLICATE_TEAM_MEMBERSHIP") continue; // skip duplicates silently
      throw e;
    }
  }
  return created;
}

export function mergeMembersIntoCache(
  qc: QueryClient,
  orgId: number,
  teamId: number,
  newMembers: TeamMember[]
) {
  const key = teamKeys.members(orgId, teamId);
  const prev = qc.getQueryData<TeamMember[]>(key) || [];
  const seen = new Set(prev.map((m) => m.userId));
  const merged = [...prev];
  newMembers.forEach((m) => {
    if (!seen.has(m.userId)) {
      merged.push(m);
      seen.add(m.userId);
    }
  });
  qc.setQueryData(key, merged);
}

export async function removeMemberFromTeam(
  orgId: number,
  teamId: number,
  membershipId: number
) {
  const res = await apiRequest<{ success: boolean }>(
    `/organizations/${orgId}/teams/${teamId}/members/${membershipId}`,
    null,
    z.object({ success: z.boolean() }),
    { method: "DELETE" }
  );
  return unwrap(res);
}
