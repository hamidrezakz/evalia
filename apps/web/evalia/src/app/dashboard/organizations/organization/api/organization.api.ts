import { apiRequest } from "@/lib/api-client";
import {
  OrganizationSchema,
  OrganizationListResponseSchema,
  CreateOrganizationInputSchema,
  UpdateOrganizationInputSchema,
  ChangeOrganizationStatusSchema,
  ListOrganizationsQuerySchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type ChangeOrganizationStatusInput,
  type ListOrganizationsQuery,
  type OrganizationListResponse,
  type Organization,
} from "../types/organization.types";
import { z } from "zod";

// Build query string with only defined values
function buildQuery(params: Partial<ListOrganizationsQuery>) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.plan) search.set("plan", params.plan);
  if (params.orderBy) search.set("orderBy", params.orderBy);
  if (params.orderDir) search.set("orderDir", params.orderDir);
  return search.toString();
}

// List organizations (paginated)
export async function listOrganizations(
  params: Partial<ListOrganizationsQuery> = {}
) {
  // Validate input query separately (non-blocking for partial) - we allow partial so use safeParse
  const parsed = ListOrganizationsQuerySchema.partial().safeParse(params);
  if (!parsed.success) {
    throw parsed.error; // can wrap in ApiError if desired
  }
  const qs = buildQuery(params);
  return apiRequest<OrganizationListResponse>(
    `/organizations${qs ? `?${qs}` : ""}`,
    null,
    OrganizationListResponseSchema
  );
}

// Get single organization
export async function getOrganization(id: number) {
  return apiRequest<Organization>(
    `/organizations/${id}`,
    null,
    OrganizationSchema
  );
}

// Create organization
export async function createOrganization(input: CreateOrganizationInput) {
  return apiRequest<Organization, CreateOrganizationInput>(
    "/organizations",
    CreateOrganizationInputSchema,
    OrganizationSchema,
    { method: "POST", body: input }
  );
}

// Update organization
export async function updateOrganization(
  id: number,
  input: UpdateOrganizationInput
) {
  return apiRequest<Organization, UpdateOrganizationInput>(
    `/organizations/${id}`,
    UpdateOrganizationInputSchema,
    OrganizationSchema,
    { method: "PATCH", body: input }
  );
}

// Soft delete organization
export async function deleteOrganization(id: number) {
  return apiRequest<{ success: boolean }>(
    `/organizations/${id}`,
    null,
    z.object({ success: z.boolean() }),
    { method: "DELETE" }
  );
}

// Restore soft-deleted organization
export async function restoreOrganization(id: number) {
  return apiRequest<Organization>(
    `/organizations/${id}/restore`,
    null,
    OrganizationSchema,
    { method: "POST" }
  );
}

// Change organization status
export async function changeOrganizationStatus(
  id: number,
  input: ChangeOrganizationStatusInput
) {
  return apiRequest<Organization, ChangeOrganizationStatusInput>(
    `/organizations/${id}/status`,
    ChangeOrganizationStatusSchema,
    OrganizationSchema,
    { method: "POST", body: input }
  );
}

// Convenience: ensure slug uniqueness on client optionally (HEAD pattern not implemented backend yet) - placeholder
export async function ensureOrgSlugAvailable(slug: string) {
  // Placeholder (could call /organizations?q=slug and filter). Not implemented fully.
  const res = await listOrganizations({ q: slug, pageSize: 1 });
  return !res.data.some((o) => o.slug === slug);
}
