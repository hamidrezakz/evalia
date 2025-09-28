import { z } from "zod";
import {
  QuestionTypeEnum,
  type QuestionType as QuestionTypeLib,
} from "@/lib/enums";

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
// Build Zod enum from centralized enum values to keep single source of truth
const questionTypeLiterals = QuestionTypeEnum.values as unknown as [
  QuestionTypeLib,
  ...QuestionTypeLib[]
];
export const questionTypeEnum = z.enum(questionTypeLiterals);
export type QuestionType = QuestionTypeLib;
