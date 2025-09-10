import { z } from "zod";

/**
 * Auth module shared schemas & types
 * These describe ONLY the inner `data` portion of the standardized API envelope.
 *
 * Global envelope produced by backend interceptor:
 * {
 *   success: boolean,
 *   code: number,
 *   message: string | null,
 *   error: any | null,
 *   data: <InnerPayload>,
 *   meta: PaginationOrContextMeta | null,
 *   tookMs: number
 * }
 *
 * NOTES:
 * - Auth endpoints do not use pagination -> meta is null.
 * - Validation focuses on inner payload (data) here; the outer shell is validated by apiRequest.
 * - Keep these schemas minimal to reduce coupling with future user profile expansion.
 *
 * Example usage:
 * const res = await loginWithPassword(...);
 * res.data.user.id // typed
 * res.meta // null for auth
 */

// Helpers
export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type Tokens = z.infer<typeof tokensSchema>;

// User (minimal shape returned by auth flows)
export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().nullable().optional(),
  phone: z.string(),
  fullName: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

// Request body schemas
export const phoneSchema = z.object({ phone: z.string().min(9) });
export const passwordSchema = z.object({ password: z.string().min(6) });
export const otpRequestSchema = z.object({
  phone: z.string(),
  purpose: z.string(),
});
export const otpVerifySchema = otpRequestSchema.extend({
  code: z.string().min(6).max(6),
});
export const completeRegistrationSchema = z.object({
  signupToken: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
});

// Inner response payload schemas
export const checkIdentifierDataSchema = z
  .object({ exists: z.boolean() })
  .passthrough();
export type CheckIdentifierData = z.infer<typeof checkIdentifierDataSchema>;

export const otpRequestDataSchema = z.object({
  ok: z.boolean(),
  devCode: z.string().optional(),
});
export type OtpRequestData = z.infer<typeof otpRequestDataSchema>;

export const completeRegistrationDataSchema = z.object({
  user: authUserSchema,
  tokens: tokensSchema,
});
export type CompleteRegistrationData = z.infer<
  typeof completeRegistrationDataSchema
>;

export const verifyOtpLoginDataSchema = z.object({
  user: authUserSchema,
  tokens: tokensSchema,
  mode: z.literal("LOGIN"),
});
export const verifyOtpSignupDataSchema = z.object({
  signupToken: z.string(),
  mode: z.literal("SIGNUP"),
});
export const verifyOtpDataSchema = z.union([
  verifyOtpLoginDataSchema,
  verifyOtpSignupDataSchema,
]);
export type VerifyOtpData = z.infer<typeof verifyOtpDataSchema>;

export const loginPasswordDataSchema = z.object({
  user: authUserSchema,
  tokens: tokensSchema,
});
export type LoginPasswordData = z.infer<typeof loginPasswordDataSchema>;

// Aggregated types for convenience
export interface AuthApiSchemas {
  checkIdentifier: typeof checkIdentifierDataSchema;
  otpRequest: typeof otpRequestDataSchema;
  verifyOtp: typeof verifyOtpDataSchema;
  completeRegistration: typeof completeRegistrationDataSchema;
  loginPassword: typeof loginPasswordDataSchema;
}
