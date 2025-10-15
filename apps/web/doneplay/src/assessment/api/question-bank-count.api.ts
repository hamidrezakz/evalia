import { apiRequest } from "@/lib/api.client";
import { appendOrgId } from "./org-path";
import {
  questionBankCountSchema,
  type QuestionBankCount,
} from "../types/question-bank-count.types";

/**
 * Fetch only the questions count for a specific question bank.
 * orgId must be passed explicitly (no implicit context lookup) so that
 * multi-tenant cache keys remain correct and requests satisfy guarded endpoints.
 */
export async function getQuestionBankCount(
  bankId: number,
  orgId?: number | null
) {
  if (!Number.isInteger(bankId) || bankId <= 0)
    throw new Error("bankId must be positive integer");
  const path = appendOrgId(`/question-banks/${bankId}/questions-count`, orgId);
  const res = await apiRequest(path, null, questionBankCountSchema);
  // Return only the validated inner data object
  return res.data as QuestionBankCount;
}
