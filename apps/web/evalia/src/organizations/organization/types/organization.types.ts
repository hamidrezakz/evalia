import { z } from "zod";
import {
  OrgPlanEnum as OrgPlanEnumCentral,
  OrganizationStatusEnum as OrganizationStatusEnumCentral,
  LocaleEnum as LocaleEnumCentral,
} from "@/lib/enums";

// Enums - use centralized app-wide enums to avoid drift
export const OrgPlanEnum = z.enum(
  OrgPlanEnumCentral.values as [string, ...string[]]
);
export const OrganizationStatusEnum = z.enum(
  OrganizationStatusEnumCentral.values as [string, ...string[]]
);
export const LocaleEnum = z.enum(
  LocaleEnumCentral.values as [string, ...string[]]
);

// Base organization schema (full)
export const OrganizationMembershipSchema = z.object({
  roles: z.array(z.string()),
  membershipId: z.number().nullable().optional(),
});
export const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  status: OrganizationStatusEnum,
  plan: OrgPlanEnum,
  locale: LocaleEnum.optional(),
  timezone: z.string().optional(),
  billingEmail: z.string().email().optional().nullable(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
  membership: OrganizationMembershipSchema.optional().nullable(),
  // --- fields from backend response ---
  primaryOwnerId: z.number().nullable().optional(),
  settings: z.record(z.string(), z.any()).optional().nullable(),
  trialEndsAt: z.string().nullable().optional(),
  lockedAt: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
  createdById: z.number().nullable().optional(),
});

// Create payload
export const CreateOrganizationInputSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  locale: LocaleEnum.optional(),
  plan: OrgPlanEnum.optional(),
  timezone: z.string().optional(),
});

// Update payload (all optional)
export const UpdateOrganizationInputSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  locale: LocaleEnum.optional(),
  plan: OrgPlanEnum.optional(),
  timezone: z.string().optional(),
  billingEmail: z.string().email().optional(),
});

export const ChangeOrganizationStatusSchema = z.object({
  status: OrganizationStatusEnum,
});

export const ListOrganizationsQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  status: OrganizationStatusEnum.optional(),
  plan: OrgPlanEnum.optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
});

export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Inner data schema for list responses (the interceptor already lifts meta to outer envelope)
export const OrganizationArraySchema = z.array(OrganizationSchema);

export const listOrganizationsResponseSchema = z.object({
  data: z.array(OrganizationSchema),
  meta: PaginationMetaSchema.nullable(),
});

// Types
export type OrganizationMembership = z.infer<
  typeof OrganizationMembershipSchema
>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganizationInput = z.infer<
  typeof CreateOrganizationInputSchema
>;
export type UpdateOrganizationInput = z.infer<
  typeof UpdateOrganizationInputSchema
>;
export type ChangeOrganizationStatusInput = z.infer<
  typeof ChangeOrganizationStatusSchema
>;
export type ListOrganizationsQuery = z.infer<
  typeof ListOrganizationsQuerySchema
>;
export type OrganizationArray = z.infer<typeof OrganizationArraySchema>;
export type ListOrganizationsResponse = z.infer<
  typeof listOrganizationsResponseSchema
>;
