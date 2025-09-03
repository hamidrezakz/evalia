import { apiRequest } from "@/lib/api-client";
import {
  TeamMembershipListResponseSchema,
  TeamMembershipSchema,
  AddTeamMemberInputSchema,
  type TeamMembershipListResponse,
  type TeamMembership,
  type AddTeamMemberInput,
} from "../types/team-membership.types";
import { z } from "zod";

function buildQuery(params: { page?: number; pageSize?: number }) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  return search.toString();
}

export async function listTeamMembers(
  orgId: number,
  teamId: number,
  params: { page?: number; pageSize?: number } = {}
) {
  const qs = buildQuery(params);
  return apiRequest<TeamMembershipListResponse>(
    `/organizations/${orgId}/teams/${teamId}/members${qs ? `?${qs}` : ""}`,
    null,
    TeamMembershipListResponseSchema
  );
}

export async function addTeamMember(
  orgId: number,
  teamId: number,
  input: AddTeamMemberInput
) {
  return apiRequest<TeamMembership, AddTeamMemberInput>(
    `/organizations/${orgId}/teams/${teamId}/members`,
    AddTeamMemberInputSchema,
    TeamMembershipSchema,
    { method: "POST", body: input }
  );
}

export async function removeTeamMember(
  orgId: number,
  teamId: number,
  membershipId: number
) {
  return apiRequest<{ success: boolean }>(
    `/organizations/${orgId}/teams/${teamId}/members/${membershipId}`,
    null,
    z.object({ success: z.boolean() }),
    { method: "DELETE" }
  );
}
