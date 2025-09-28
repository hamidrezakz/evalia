import { z } from "zod";

// Lightweight response shape for question bank question count
export const questionBankCountSchema = z.object({
  bankId: z.number().int().positive(),
  questionsCount: z.number().int().nonnegative(),
});
export type QuestionBankCount = z.infer<typeof questionBankCountSchema>;
