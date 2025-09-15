import { apiRequest } from "@/lib/api.client";
import {
  questionBankCountSchema,
  type QuestionBankCount,
} from "../types/question-bank-count.types";

/** Fetch only the questions count for a specific question bank */
export async function getQuestionBankCount(bankId: number) {
  if (!Number.isInteger(bankId) || bankId <= 0)
    throw new Error("bankId must be positive integer");
  const res = await apiRequest(
    `/question-banks/${bankId}/questions-count`,
    null,
    questionBankCountSchema
  );
  // Return only the validated inner data object
  return res.data as QuestionBankCount;
}
