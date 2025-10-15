import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import { appendOrgId } from "./org-path";
import {
  questionsListEnvelope,
  questionSchema,
  listQuestionsQuerySchema,
  buildQuestionsQuery,
  type ListQuestionsQuery,
  type Question,
  optionSetOptionSchema,
} from "../types/question-banks.types";

const detailSchema = questionSchema;

function buildListPath(raw?: Partial<ListQuestionsQuery>): string {
  if (!raw) return "/questions";
  const parsed = listQuestionsQuerySchema.safeParse(raw);
  if (!parsed.success)
    throw new Error("Invalid question list query parameters");
  return "/questions" + buildQuestionsQuery(parsed.data);
}

export async function listQuestions(
  params?: Partial<ListQuestionsQuery>,
  orgId?: number | null
): Promise<{ data: Question[]; meta: unknown }> {
  const path = appendOrgId(buildListPath(params), orgId);
  const res = await apiRequest(path, null, null);
  const validated = questionsListEnvelope.safeParse({
    data: res.data,
    meta: res.meta,
  });
  if (!validated.success)
    throw new Error(
      "Question list validation failed: " + validated.error.message
    );
  return validated.data;
}

export async function getQuestion(
  id: number,
  orgId?: number | null
): Promise<Question> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("Question id must be positive");
  const res = await apiRequest(
    appendOrgId(`/questions/${id}`, orgId),
    null,
    detailSchema
  );
  return res as unknown as Question;
}

// Creation / update
export const createQuestionBody = z
  .object({
    bankId: z.number().int().positive(),
    text: z.string().min(2),
    type: z.enum(["SCALE", "TEXT", "MULTI_CHOICE", "SINGLE_CHOICE", "BOOLEAN"]),
    code: z.string().optional(),
    // allow explicitly null to detach
    optionSetId: z.number().int().positive().nullable().optional(),
    options: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          order: z.number().int().nonnegative().optional(),
        })
      )
      .optional(),
    minScale: z.number().int().optional(),
    maxScale: z.number().int().optional(),
    meta: z.any().optional(),
  })
  .refine(
    (data) => {
      // if optionSetId provided, do not send inline options (backend rejects both)
      if (data.optionSetId && data.options) return false;
      return true;
    },
    {
      message: "ارسال همزمان optionSetId و options مجاز نیست",
      path: ["options"],
    }
  );
export type CreateQuestionBody = z.infer<typeof createQuestionBody>;
export async function createQuestion(
  body: CreateQuestionBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId("/questions", orgId),
    createQuestionBody,
    questionSchema,
    { body }
  );
  return res as unknown as Question;
}

export const updateQuestionBody = createQuestionBody.partial();
export type UpdateQuestionBody = z.infer<typeof updateQuestionBody>;
export async function updateQuestion(
  id: number,
  body: UpdateQuestionBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/questions/${id}`, orgId),
    updateQuestionBody,
    questionSchema,
    { method: "PATCH", body }
  );
  return res as unknown as Question;
}

export async function deleteQuestion(id: number, orgId?: number | null) {
  await apiRequest(appendOrgId(`/questions/${id}`, orgId), null, null, {
    method: "DELETE",
  });
  return { id };
}
