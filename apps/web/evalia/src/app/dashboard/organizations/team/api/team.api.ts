import { apiRequest } from "@/lib/api-client";
import { z } from "zod";

export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  organizationId: z.number(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const TeamListMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const TeamListResponseSchema = z.object({
  data: z.array(TeamSchema),
  meta: TeamListMetaSchema,
  tookMs: z.number().optional(),
});

export async function listTeams(
  orgId: number,
  params: { page?: number; pageSize?: number; q?: string } = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  return apiRequest(
    `/organizations/${orgId}/teams?${search.toString()}`,
    null,
    TeamListResponseSchema
  );
}

export async function createTeam(orgId: number, body: { name: string }) {
  return apiRequest(
    `/organizations/${orgId}/teams`,
    z.object({ name: z.string() }),
    TeamSchema,
    { method: "POST", body }
  );
}
