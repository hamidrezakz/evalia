import { z } from "zod";

export const TeamSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const CreateTeamInputSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().optional(),
});

export const UpdateTeamInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pageCount: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const TeamListResponseSchema = z.object({
  data: z.array(TeamSchema),
  meta: PaginationMetaSchema,
});

export type Team = z.infer<typeof TeamSchema>;
export type CreateTeamInput = z.infer<typeof CreateTeamInputSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamInputSchema>;
export type TeamListResponse = z.infer<typeof TeamListResponseSchema>;
