// Types & schemas for templates, sessions, assignments, responses
import { z } from "zod";
import { SessionStateEnum, ResponsePerspectiveEnum } from "@/lib/enums";
import { paginationMetaSchema } from "./common";
import {
  questionSchema,
  optionSetSchema,
  optionSetOptionSchema,
} from "./question-banks.types";

export const templateStateEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
]);
export type TemplateState = z.infer<typeof templateStateEnum>;
export const templateSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  state: templateStateEnum,
  meta: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Template = z.infer<typeof templateSchema>;

export const listTemplatesQuerySchema = z.object({
  state: templateStateEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
});
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;
export function buildTemplatesQuery(params: Partial<ListTemplatesQuery>) {
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

export const templateSectionSchema = z.object({
  id: z.number().int().positive(),
  templateId: z.number().int().positive(),
  title: z.string(),
  order: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type TemplateSection = z.infer<typeof templateSectionSchema>;

export const templateQuestionLinkSchema = z.object({
  id: z.number().int().positive(),
  sectionId: z.number().int().positive(),
  questionId: z.number().int().positive(),
  order: z.number().int().nonnegative(),
  perspectives: z.array(z.string()),
  required: z.boolean(),
  question: questionSchema.optional(),
});
export type TemplateQuestionLink = z.infer<typeof templateQuestionLinkSchema>;

// Full template with nested sections & questions & resolved options/optionSet
export const fullTemplateSchema = templateSchema.extend({
  sections: z.array(
    templateSectionSchema.extend({
      questions: z.array(
        templateQuestionLinkSchema.extend({
          question: questionSchema
            .extend({
              options: z
                .array(
                  z.object({
                    id: z.number(),
                    value: z.string(),
                    label: z.string(),
                    order: z.number().optional(),
                  })
                )
                .optional(),
              optionSet: optionSetSchema
                .extend({ options: z.array(optionSetOptionSchema).optional() })
                .nullable()
                .optional(),
            })
            .optional(),
        })
      ),
    })
  ),
});
export type FullTemplate = z.infer<typeof fullTemplateSchema>;

export const templatesListEnvelope = z.object({
  data: z.array(templateSchema),
  meta: paginationMetaSchema,
});

// Sessions & assignments & responses
export const sessionStateEnum = z.enum(
  SessionStateEnum.values as [string, ...string[]]
);
export type SessionState = z.infer<typeof sessionStateEnum>;
export const sessionSchema = z.object({
  id: z.number().int().positive(),
  organizationId: z.number().int().positive(),
  templateId: z.number().int().positive(),
  teamScopeId: z.number().int().positive().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  state: sessionStateEnum,
  startAt: z.string(),
  endAt: z.string(),
  meta: z.any().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Session = z.infer<typeof sessionSchema>;

export const listSessionsQuerySchema = z.object({
  organizationId: z.coerce.number().int().positive().optional(),
  templateId: z.coerce.number().int().positive().optional(),
  state: sessionStateEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(100).default(20).optional(),
});
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export function buildSessionsQuery(params: Partial<ListSessionsQuery>) {
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

export const responsePerspectiveEnum = z.enum(
  ResponsePerspectiveEnum.values as [string, ...string[]]
);
export type ResponsePerspective = z.infer<typeof responsePerspectiveEnum>;
export const assignmentSchema = z.object({
  id: z.number().int().positive(),
  sessionId: z.number().int().positive(),
  userId: z.number().int().positive(),
  perspective: responsePerspectiveEnum,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Assignment = z.infer<typeof assignmentSchema>;

export const responseSchema = z.object({
  id: z.number().int().positive(),
  assignmentId: z.number().int().positive(),
  sessionId: z.number().int().positive(),
  templateQuestionId: z.number().int().positive(),
  scaleValue: z.number().nullable().optional(),
  optionValue: z.string().nullable().optional(),
  optionValues: z.array(z.string()).optional(),
  textValue: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type AssessmentResponse = z.infer<typeof responseSchema>;

export const listResponsesQuerySchema = z.object({
  sessionId: z.coerce.number().int().positive(),
  assignmentId: z.coerce.number().int().positive().optional(),
  templateQuestionId: z.coerce.number().int().positive().optional(),
  questionId: z.coerce.number().int().positive().optional(),
  perspective: responsePerspectiveEnum.optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(200).default(50).optional(),
});
export type ListResponsesQuery = z.infer<typeof listResponsesQuerySchema>;
