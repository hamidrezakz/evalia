import { z } from "zod";

export const TeamMemberUserSchema = z.object({
  id: z.number(),
  fullName: z.string().nullable().optional(),
  email: z.string().email(),
});

export const TeamMembershipSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  userId: z.number(),
  createdAt: z.string(),
  user: TeamMemberUserSchema.optional(),
});

export const TeamMembershipListResponseSchema = z.object({
  data: z.array(TeamMembershipSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    pageCount: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const AddTeamMemberInputSchema = z.object({
  userId: z.number(),
});

export type TeamMembership = z.infer<typeof TeamMembershipSchema>;
export type TeamMembershipListResponse = z.infer<
  typeof TeamMembershipListResponseSchema
>;
export type AddTeamMemberInput = z.infer<typeof AddTeamMemberInputSchema>;
