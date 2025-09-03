import { apiRequest } from "@/lib/api-client";
import { z } from "zod";

export const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  plan: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const OrganizationListMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const OrganizationListResponseSchema = z.object({
  data: z.array(OrganizationSchema),
  meta: OrganizationListMetaSchema,
  tookMs: z.number().optional(),
});

export async function listOrganizations(
  params: { page?: number; pageSize?: number; q?: string } = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  return apiRequest(
    `/organizations?${search.toString()}`,
    null,
    OrganizationListResponseSchema
  );
}

export async function createOrganization(body: {
  name: string;
  slug?: string;
  plan?: string;
}) {
  return apiRequest(
    "/organizations",
    z.object({
      name: z.string(),
      slug: z.string().optional(),
      plan: z.string().optional(),
    }),
    OrganizationSchema,
    { method: "POST", body }
  );
}
