import { apiRequest } from "@/lib/api.client";
import {
  OrganizationSchema,
  OrganizationArraySchema,
  CreateOrganizationInputSchema,
  UpdateOrganizationInputSchema,
  ChangeOrganizationStatusSchema,
  ListOrganizationsQuerySchema,
  listOrganizationsResponseSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type ChangeOrganizationStatusInput,
  type ListOrganizationsQuery,
  type OrganizationArray,
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
  // Strict validation: use listOrganizationsResponseSchema
  const res = await apiRequest(
    `/organizations${qs ? `?${qs}` : ""}`,
    null,
    listOrganizationsResponseSchema
  );
  // Always return a defined value
  if (!res || !res.data) {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
  return res;
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
  const res = await listOrganizations({ q: slug, pageSize: 1 });
  return !res.data.some((o: Organization) => o.slug === slug);
}

// List organizations current authenticated user is member of (non-paginated for auth context usage)
export async function listUserOrganizations(): Promise<OrganizationArray> {
  const res = await apiRequest<OrganizationArray>(
    `/organizations/my`,
    null,
    OrganizationArraySchema
  );
  // res.data is already validated OrganizationArray
  return res.data;
}
