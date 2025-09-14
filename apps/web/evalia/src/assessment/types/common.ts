import { z } from "zod";

// Shared pagination meta (aligned with backend envelope meta expectations)
export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  pageCount: z.number().int().nonnegative().optional(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

// Question type enum (subset mirror of backend QuestionType)
export const questionTypeEnum = z.enum([
  "SCALE",
  "TEXT",
  "MULTI_CHOICE",
  "SINGLE_CHOICE",
  "BOOLEAN",
]);
export type QuestionType = z.infer<typeof questionTypeEnum>;
