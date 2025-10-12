import { apiRequest } from "@/lib/api.client";
import { z } from "zod";
import {
  OrganizationSchema,
  OrganizationArraySchema,
  CreateOrganizationInputSchema,
  UpdateOrganizationInputSchema,
  ChangeOrganizationStatusSchema,
  ListOrganizationsQuerySchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type ChangeOrganizationStatusInput,
  type ListOrganizationsQuery,
  type OrganizationArray,
  type Organization,
} from "../types/organization.types";
import {
  OrganizationCapabilityEnum,
  OrganizationRelationshipTypeEnum,
  type OrganizationCapability,
  type OrganizationRelationshipType,
} from "@/lib/enums";

// Envelope schema for paginated organization lists
const organizationListEnvelopeSchema = z.object({
  data: OrganizationArraySchema,
  meta: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    pageCount: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

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
  const res = await apiRequest(
    `/organizations${qs ? `?${qs}` : ""}`,
    null,
    null
  );
  const validated = organizationListEnvelopeSchema.safeParse(res);
  if (!validated.success) {
    throw new Error(
      "Organization list response validation failed: " + validated.error.message
    );
  }
  return validated.data; // return full envelope (data, meta)
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

// List organizations that are parents in any relationship (distinct parents)
export async function listParentOrganizations(
  params: Partial<ListOrganizationsQuery> = {}
) {
  const parsed = ListOrganizationsQuerySchema.partial().safeParse(params);
  if (!parsed.success) throw parsed.error;
  const qs = buildQuery(params);
  const res = await apiRequest(
    `/organizations/parents-only/list${qs ? `?${qs}` : ""}`,
    null,
    null
  );
  const validated = organizationListEnvelopeSchema.safeParse(res);
  if (!validated.success) {
    throw new Error(
      "Parent organizations list response validation failed: " +
        validated.error.message
    );
  }
  return validated.data; // { data, meta }
}

// ------------------------------
// Capabilities API
// ------------------------------

// Capability assignment record (minimal fields we rely on)
export const OrganizationCapabilityAssignmentSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  capability: z.enum(
    OrganizationCapabilityEnum.values as [string, ...string[]]
  ),
  active: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type OrganizationCapabilityAssignment = z.infer<
  typeof OrganizationCapabilityAssignmentSchema
>;

export async function listOrganizationCapabilities(organizationId: number) {
  const res = await apiRequest<OrganizationCapabilityAssignment[]>(
    `/organizations/${organizationId}/capabilities`,
    null,
    z.array(OrganizationCapabilityAssignmentSchema)
  );
  return res.data;
}

export const AddOrganizationCapabilityInputSchema = z.object({
  capability: z.enum(
    OrganizationCapabilityEnum.values as [string, ...string[]]
  ),
});
export type AddOrganizationCapabilityInput = z.infer<
  typeof AddOrganizationCapabilityInputSchema
>;

export async function addOrganizationCapability(
  organizationId: number,
  input: AddOrganizationCapabilityInput
) {
  // Backend returns either created record or { id } when re-activating; we accept any object
  return apiRequest<Record<string, unknown>, AddOrganizationCapabilityInput>(
    `/organizations/${organizationId}/capabilities`,
    AddOrganizationCapabilityInputSchema,
    null,
    { method: "POST", body: input }
  );
}

export const RemoveOrganizationCapabilityInputSchema = z.object({
  capability: z.enum(
    OrganizationCapabilityEnum.values as [string, ...string[]]
  ),
});
export type RemoveOrganizationCapabilityInput = z.infer<
  typeof RemoveOrganizationCapabilityInputSchema
>;

export async function removeOrganizationCapability(
  organizationId: number,
  input: RemoveOrganizationCapabilityInput
) {
  return apiRequest<Record<string, unknown>, RemoveOrganizationCapabilityInput>(
    `/organizations/${organizationId}/capabilities`,
    RemoveOrganizationCapabilityInputSchema,
    null,
    { method: "DELETE", body: input }
  );
}

// ------------------------------
// Relationships API
// ------------------------------

export const OrganizationRelationshipSchema = z.object({
  id: z.number(),
  parentOrganizationId: z.number(),
  childOrganizationId: z.number(),
  relationshipType: z.enum(
    OrganizationRelationshipTypeEnum.values as [string, ...string[]]
  ),
  cascadeResources: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  // when listing children/parents, backend includes the counterpart organization
  child: OrganizationSchema.optional(),
  parent: OrganizationSchema.optional(),
});
export type OrganizationRelationship = z.infer<
  typeof OrganizationRelationshipSchema
>;

export const CreateOrganizationRelationshipInputSchema = z.object({
  parentOrganizationId: z.number(),
  childOrganizationId: z.number(),
  relationshipType: z.enum(
    OrganizationRelationshipTypeEnum.values as [string, ...string[]]
  ),
  cascadeResources: z.boolean().optional(),
});
export type CreateOrganizationRelationshipInput = z.infer<
  typeof CreateOrganizationRelationshipInputSchema
>;

export async function createOrganizationRelationship(
  input: CreateOrganizationRelationshipInput
) {
  return apiRequest<
    OrganizationRelationship,
    CreateOrganizationRelationshipInput
  >(
    `/organizations/relationships`,
    CreateOrganizationRelationshipInputSchema,
    OrganizationRelationshipSchema,
    { method: "POST", body: input }
  );
}

export const DeleteOrganizationRelationshipInputSchema = z.object({
  parentOrganizationId: z.number(),
  childOrganizationId: z.number(),
});
export type DeleteOrganizationRelationshipInput = z.infer<
  typeof DeleteOrganizationRelationshipInputSchema
>;

export async function deleteOrganizationRelationship(
  input: DeleteOrganizationRelationshipInput
) {
  return apiRequest<
    Record<string, unknown>,
    DeleteOrganizationRelationshipInput
  >(
    `/organizations/relationships`,
    DeleteOrganizationRelationshipInputSchema,
    null,
    { method: "DELETE", body: input }
  );
}

export async function listOrganizationChildren(
  parentOrganizationId: number,
  params: Partial<ListOrganizationsQuery> = {}
) {
  const parsed = ListOrganizationsQuerySchema.partial().safeParse(params);
  if (!parsed.success) throw parsed.error;
  const qs = buildQuery(params);
  const res = await apiRequest<OrganizationRelationship[]>(
    `/organizations/${parentOrganizationId}/children${qs ? `?${qs}` : ""}`,
    null,
    z.array(OrganizationRelationshipSchema)
  );
  return res.data;
}

export async function listOrganizationParents(childOrganizationId: number) {
  const res = await apiRequest<OrganizationRelationship[]>(
    `/organizations/${childOrganizationId}/parents`,
    null,
    z.array(OrganizationRelationshipSchema)
  );
  return res.data;
}

// ------------------------------
// Public branding by slug (for org-specific login page)
// ------------------------------

export const OrganizationPublicBrandSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  plan: z.string().optional(),
  status: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});
export type OrganizationPublicBrand = z.infer<
  typeof OrganizationPublicBrandSchema
>;

export async function getOrganizationBySlugPublic(slug: string) {
  return apiRequest<OrganizationPublicBrand>(
    `/organizations/by-slug/${encodeURIComponent(slug)}/public`,
    null,
    OrganizationPublicBrandSchema
  );
}
