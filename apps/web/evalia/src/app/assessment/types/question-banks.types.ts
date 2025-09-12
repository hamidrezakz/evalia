import { z } from "zod";
import { paginationMetaSchema, questionTypeEnum } from "./common";

// QuestionBank item
export const questionBankSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isSystem: z.boolean().optional().default(false),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type QuestionBank = z.infer<typeof questionBankSchema>;

export const listQuestionBanksQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
});
export type ListQuestionBanksQuery = z.infer<
  typeof listQuestionBanksQuerySchema
>;

export function buildQuestionBanksQuery(
  params: Partial<ListQuestionBanksQuery>
) {
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    entries.push([k, String(v)]);
  }
  const qs = entries
    .map((e) => `${encodeURIComponent(e[0])}=${encodeURIComponent(e[1])}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

// Question item shape (simplified)
export const questionSchema = z.object({
  id: z.number().int().positive(),
  bankId: z.number().int().positive(),
  text: z.string(),
  type: questionTypeEnum,
  code: z.string().nullable().optional(),
  optionSetId: z.number().int().positive().nullable().optional(),
  minScale: z.number().int().nullable().optional(),
  maxScale: z.number().int().nullable().optional(),
  meta: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Question = z.infer<typeof questionSchema>;

export const listQuestionsQuerySchema = z.object({
  bankId: z.coerce.number().int().positive().optional(),
  type: questionTypeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
});
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;

export function buildQuestionsQuery(params: Partial<ListQuestionsQuery>) {
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    entries.push([k, String(v)]);
  }
  const qs = entries
    .map((e) => `${encodeURIComponent(e[0])}=${encodeURIComponent(e[1])}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

// OptionSet types
export const optionSetSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isSystem: z.boolean().optional().default(false),
  meta: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type OptionSet = z.infer<typeof optionSetSchema>;

export const listOptionSetsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
});
export type ListOptionSetsQuery = z.infer<typeof listOptionSetsQuerySchema>;

export function buildOptionSetsQuery(params: Partial<ListOptionSetsQuery>) {
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    entries.push([k, String(v)]);
  }
  const qs = entries
    .map((e) => `${encodeURIComponent(e[0])}=${encodeURIComponent(e[1])}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

export const optionSetOptionSchema = z.object({
  id: z.number().int().positive(),
  optionSetId: z.number().int().positive(),
  value: z.string(),
  label: z.string(),
  order: z.number().int().nonnegative().optional(),
  meta: z.any().optional().nullable(),
  createdAt: z.string().optional(),
});
export type OptionSetOption = z.infer<typeof optionSetOptionSchema>;

// Common list envelopes (generic pattern like users.api)
export const questionBanksListEnvelope = z.object({
  data: z.array(questionBankSchema),
  meta: paginationMetaSchema,
});
export const questionsListEnvelope = z.object({
  data: z.array(questionSchema),
  meta: paginationMetaSchema,
});
export const optionSetsListEnvelope = z.object({
  data: z.array(optionSetSchema),
  meta: paginationMetaSchema,
});

export const optionSetOptionsListSchema = z.array(optionSetOptionSchema);
