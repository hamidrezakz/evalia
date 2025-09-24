import { z } from "zod";

export const OrganizationMembershipSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  userId: z.number(),
  roles: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type OrganizationMembership = z.infer<
  typeof OrganizationMembershipSchema
>;

export const OrganizationMembershipArraySchema = z.array(
  OrganizationMembershipSchema
);
export type OrganizationMembershipArray = z.infer<
  typeof OrganizationMembershipArraySchema
>;

export const AddOrganizationMemberInputSchema = z.object({
  userId: z.number(),
  roles: z.array(z.string()).optional(),
});
export type AddOrganizationMemberInput = z.infer<
  typeof AddOrganizationMemberInputSchema
>;

export const UpdateOrganizationMemberRolesInputSchema = z.object({
  roles: z.array(z.string()).min(1),
});
export type UpdateOrganizationMemberRolesInput = z.infer<
  typeof UpdateOrganizationMemberRolesInputSchema
>;
