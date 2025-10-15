import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import { appendOrgId } from "./org-path";
import {
  templateSchema,
  templatesListEnvelope,
  listTemplatesQuerySchema,
  buildTemplatesQuery,
  fullTemplateSchema,
  templateSectionSchema,
  templateQuestionLinkSchema,
  type ListTemplatesQuery,
  type Template,
  type FullTemplate,
  type TemplateSection,
  type TemplateQuestionLink,
} from "../types/templates.types";

function buildListPath(raw?: Partial<ListTemplatesQuery>) {
  if (!raw) return "/templates";
  const parsed = listTemplatesQuerySchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid template list params");
  return "/templates" + buildTemplatesQuery(parsed.data);
}

export async function listTemplates(
  params?: Partial<ListTemplatesQuery>,
  orgId?: number | null
): Promise<{ data: Template[]; meta: unknown }> {
  const path = appendOrgId(buildListPath(params), orgId);
  const res = await apiRequest(path, null, null);
  const parsed = templatesListEnvelope.safeParse({
    data: res.data,
    meta: res.meta,
  });
  if (!parsed.success)
    throw new Error("Template list validation failed: " + parsed.error.message);
  return parsed.data;
}
export async function getTemplate(
  id: number,
  orgId?: number | null
): Promise<Template> {
  const res = await apiRequest(
    appendOrgId(`/templates/${id}`, orgId),
    null,
    templateSchema
  );
  return res as unknown as Template;
}
export async function getFullTemplate(
  id: number,
  orgId?: number | null
): Promise<FullTemplate> {
  const res = await apiRequest(
    appendOrgId(`/templates/${id}/full`, orgId),
    null,
    fullTemplateSchema
  );
  return res as unknown as FullTemplate;
}

export const createTemplateBody = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  meta: z.any().optional(),
});
export type CreateTemplateBody = z.infer<typeof createTemplateBody>;
export async function createTemplate(
  body: CreateTemplateBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId("/templates", orgId),
    createTemplateBody,
    templateSchema,
    { body }
  );
  return res as unknown as Template;
}
export const updateTemplateBody = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  state: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]).optional(),
  meta: z.any().optional(),
});
export type UpdateTemplateBody = z.infer<typeof updateTemplateBody>;
export async function updateTemplate(
  id: number,
  body: UpdateTemplateBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/templates/${id}`, orgId),
    updateTemplateBody,
    templateSchema,
    { method: "PATCH", body }
  );
  return res as unknown as Template;
}
export async function deleteTemplate(id: number, orgId?: number | null) {
  await apiRequest(appendOrgId(`/templates/${id}`, orgId), null, null, {
    method: "DELETE",
  });
  return { id };
}

// Sections
export const createSectionBody = z.object({
  templateId: z.number().int().positive(),
  title: z.string().min(1),
});
export type CreateSectionBody = z.infer<typeof createSectionBody>;
export async function createTemplateSection(
  body: CreateSectionBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId("/template-sections", orgId),
    createSectionBody,
    templateSectionSchema,
    { body }
  );
  return res as unknown as TemplateSection;
}
export async function listTemplateSections(
  templateId: number,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/template-sections/${templateId}`, orgId),
    null,
    z.array(templateSectionSchema)
  );
  return res as unknown as TemplateSection[];
}
export const updateSectionBody = z.object({
  title: z.string().min(1).optional(),
});
export type UpdateSectionBody = z.infer<typeof updateSectionBody>;
export async function updateTemplateSection(
  id: number,
  body: UpdateSectionBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/template-sections/${id}`, orgId),
    updateSectionBody,
    templateSectionSchema,
    { method: "PATCH", body }
  );
  return res as unknown as TemplateSection;
}
export const reorderSectionsBody = z.object({
  sectionIds: z.array(z.number().int().positive()),
});
export type ReorderSectionsBody = z.infer<typeof reorderSectionsBody>;
export async function reorderTemplateSections(
  templateId: number,
  body: ReorderSectionsBody,
  orgId?: number | null
) {
  await apiRequest(
    appendOrgId(`/template-sections/${templateId}/reorder`, orgId),
    reorderSectionsBody,
    null,
    { method: "POST", body }
  );
  return { templateId };
}
export async function deleteTemplateSection(id: number, orgId?: number | null) {
  await apiRequest(appendOrgId(`/template-sections/${id}`, orgId), null, null, {
    method: "DELETE",
  });
  return { id };
}

// Template Questions
export const addTemplateQuestionBody = z.object({
  sectionId: z.number().int().positive(),
  questionId: z.number().int().positive(),
  perspectives: z.array(z.string()).min(1),
  required: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
});
export type AddTemplateQuestionBody = z.infer<typeof addTemplateQuestionBody>;
export async function addTemplateQuestion(
  body: AddTemplateQuestionBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId("/template-questions", orgId),
    addTemplateQuestionBody,
    templateQuestionLinkSchema,
    { body }
  );
  return res as unknown as TemplateQuestionLink;
}
export async function listTemplateSectionQuestions(
  sectionId: number,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/template-questions/${sectionId}`, orgId),
    null,
    z.array(templateQuestionLinkSchema)
  );
  return res as unknown as TemplateQuestionLink[];
}
export const updateTemplateQuestionBody = addTemplateQuestionBody.partial();
export type UpdateTemplateQuestionBody = z.infer<
  typeof updateTemplateQuestionBody
>;
export async function updateTemplateQuestion(
  id: number,
  body: UpdateTemplateQuestionBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/template-questions/${id}`, orgId),
    updateTemplateQuestionBody,
    templateQuestionLinkSchema,
    { method: "PATCH", body }
  );
  return res as unknown as TemplateQuestionLink;
}
export const bulkSetSectionQuestionsBody = z.object({
  items: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        perspectives: z.array(z.string()).min(1),
        required: z.boolean().optional(),
      })
    )
    .default([]),
});
export type BulkSetSectionQuestionsBody = z.infer<
  typeof bulkSetSectionQuestionsBody
>;
export async function bulkSetTemplateSectionQuestions(
  sectionId: number,
  body: BulkSetSectionQuestionsBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/template-questions/${sectionId}/bulk-set`, orgId),
    bulkSetSectionQuestionsBody,
    z.array(templateQuestionLinkSchema),
    { method: "POST", body }
  );
  return res as unknown as TemplateQuestionLink[];
}
export async function deleteTemplateQuestion(
  id: number,
  orgId?: number | null
) {
  await apiRequest(
    appendOrgId(`/template-questions/${id}`, orgId),
    null,
    null,
    {
      method: "DELETE",
    }
  );
  return { id };
}
