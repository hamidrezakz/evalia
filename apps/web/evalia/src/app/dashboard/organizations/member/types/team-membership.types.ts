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

export const TeamMembershipArraySchema = z.array(TeamMembershipSchema);

export const AddTeamMemberInputSchema = z.object({
  userId: z.number(),
});

export type TeamMembership = z.infer<typeof TeamMembershipSchema>;
export type TeamMembershipArray = z.infer<typeof TeamMembershipArraySchema>;
export type AddTeamMemberInput = z.infer<typeof AddTeamMemberInputSchema>;
