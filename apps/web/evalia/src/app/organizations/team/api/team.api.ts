import { apiRequest } from "@/lib/api.client";
import {
  TeamSchema,
  TeamArraySchema,
  CreateTeamInputSchema,
  UpdateTeamInputSchema,
  type Team,
  type TeamArray,
  type CreateTeamInput,
  type UpdateTeamInput,
} from "../types/team.types";
import { z } from "zod";

function buildQuery(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  includeDeleted?: boolean;
}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.includeDeleted) search.set("includeDeleted", "true");
  return search.toString();
}

export async function listTeams(
  orgId: number,
  params: {
    page?: number;
    pageSize?: number;
    q?: string;
    includeDeleted?: boolean;
  } = {}
) {
  const qs = buildQuery(params);
  return apiRequest<TeamArray>(
    `/organizations/${orgId}/teams${qs ? `?${qs}` : ""}`,
    null,
    TeamArraySchema
  );
}

export async function getTeam(orgId: number, teamId: number) {
  return apiRequest<Team>(
    `/organizations/${orgId}/teams/${teamId}`,
    null,
    TeamSchema
  );
}

export async function createTeam(orgId: number, input: CreateTeamInput) {
  return apiRequest<Team, CreateTeamInput>(
    `/organizations/${orgId}/teams`,
    CreateTeamInputSchema,
    TeamSchema,
    { method: "POST", body: input }
  );
}

export async function updateTeam(
  orgId: number,
  teamId: number,
  input: UpdateTeamInput
) {
  return apiRequest<Team, UpdateTeamInput>(
    `/organizations/${orgId}/teams/${teamId}`,
    UpdateTeamInputSchema,
    TeamSchema,
    { method: "PATCH", body: input }
  );
}

export async function deleteTeam(orgId: number, teamId: number) {
  return apiRequest<{ success: boolean }>(
    `/organizations/${orgId}/teams/${teamId}`,
    null,
    z.object({ success: z.boolean() }),
    { method: "DELETE" }
  );
}

export async function restoreTeam(orgId: number, teamId: number) {
  return apiRequest<Team>(
    `/organizations/${orgId}/teams/${teamId}/restore`,
    null,
    TeamSchema,
    { method: "POST" }
  );
}
