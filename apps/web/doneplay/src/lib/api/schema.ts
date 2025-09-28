import { z } from "zod";

// API response envelope schema (matches backend interceptor)
export const apiResponseSchema = z.object({
  success: z.boolean(),
  code: z.number(),
  message: z.string().nullable(),
  error: z.any().nullable(),
  data: z.any(),
  meta: z.any().nullable(),
  tookMs: z.number(),
});
