import { z } from "zod";

// Enums - mirror backend Prisma enums (keep synced manually with backend). If backend adds values update here.
export const OrgPlanEnum = z.enum(["FREE", "PRO", "ENTERPRISE"]);
export const OrganizationStatusEnum = z.enum([
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
]);
export const LocaleEnum = z.enum(["FA", "EN"]);

// Base organization schema (full)
export const OrganizationMembershipSchema = z.object({
  role: z.string(),
  membershipId: z.number(),
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
  membership: OrganizationMembershipSchema.optional(),
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
