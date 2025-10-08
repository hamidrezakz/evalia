import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import { appendOrgId } from "./org-path";
import {
  questionBanksListEnvelope,
  questionBankSchema,
  listQuestionBanksQuerySchema,
  buildQuestionBanksQuery,
  type ListQuestionBanksQuery,
  type QuestionBank,
} from "../types/question-banks.types";

const detailSchema = questionBankSchema;

function buildListPath(raw?: Partial<ListQuestionBanksQuery>): string {
  if (!raw) return "/question-banks";
  const parsed = listQuestionBanksQuerySchema.safeParse(raw);
  if (!parsed.success)
    throw new Error("Invalid question bank list query parameters");
  return "/question-banks" + buildQuestionBanksQuery(parsed.data);
}

export async function listQuestionBanks(
  params?: Partial<ListQuestionBanksQuery>,
  orgId?: number | null
): Promise<{ data: QuestionBank[]; meta: unknown }> {
  const path = appendOrgId(buildListPath(params), orgId);
  const res = await apiRequest(path, null, null);
  const validated = questionBanksListEnvelope.safeParse({
    data: res.data,
    meta: res.meta,
  });
  if (!validated.success)
    throw new Error(
      "Question bank list validation failed: " + validated.error.message
    );
  return validated.data;
}

export async function getQuestionBank(
  id: number,
  orgId?: number | null
): Promise<QuestionBank> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("Question bank id must be positive");
  const res = await apiRequest(
    appendOrgId(`/question-banks/${id}`, orgId),
    null,
    detailSchema
  );
  return res as unknown as QuestionBank; // apiRequest with responseSchema returns inner validated data
}

// Create & update shapes (lightweight for client-side assistance) – align with backend DTO
export const createQuestionBankBody = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});
export type CreateQuestionBankBody = z.infer<typeof createQuestionBankBody>;
export async function createQuestionBank(
  body: CreateQuestionBankBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId("/question-banks", orgId),
    createQuestionBankBody,
    questionBankSchema,
    { body }
  );
  return res as unknown as QuestionBank;
}

export const updateQuestionBankBody = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
});
export type UpdateQuestionBankBody = z.infer<typeof updateQuestionBankBody>;
export async function updateQuestionBank(
  id: number,
  body: UpdateQuestionBankBody,
  orgId?: number | null
) {
  const res = await apiRequest(
    appendOrgId(`/question-banks/${id}`, orgId),
    updateQuestionBankBody,
    questionBankSchema,
    { method: "PATCH", body }
  );
  return res as unknown as QuestionBank;
}

export async function deleteQuestionBank(id: number, orgId?: number | null) {
  await apiRequest(appendOrgId(`/question-banks/${id}`, orgId), null, null, {
    method: "DELETE",
  });
  return { id };
}
