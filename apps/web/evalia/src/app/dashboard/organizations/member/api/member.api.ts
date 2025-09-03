import { apiRequest } from "@/lib/api-client";
import { z } from "zod";

export const OrgMemberSchema = z.object({
  id: z.number(),
  userId: z.number(),
  organizationId: z.number(),
  role: z.string(),
  createdAt: z.string(),
});

export const OrgMemberListMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const OrgMemberListResponseSchema = z.object({
  data: z.array(OrgMemberSchema),
  meta: OrgMemberListMetaSchema,
  tookMs: z.number().optional(),
});

export async function listOrgMembers(
  orgId: number,
  params: { page?: number; pageSize?: number; role?: string; q?: string } = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.role) search.set("role", params.role);
  if (params.q) search.set("q", params.q);
  return apiRequest(
    `/organizations/${orgId}/members?${search.toString()}`,
    null,
    OrgMemberListResponseSchema
  );
}

export async function addOrgMember(
  orgId: number,
  body: { userId: number; role: string }
) {
  return apiRequest(
    `/organizations/${orgId}/members`,
    z.object({ userId: z.number(), role: z.string() }),
    OrgMemberSchema,
    { method: "POST", body }
  );
}
