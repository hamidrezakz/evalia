import { z } from "zod";
import { apiRequest, ApiError } from "./api-client";
import { tokenStorage } from "@/lib/token-storage";
import { normalizePhone } from "@/lib/normalize-phone";

function isEmail(str: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str);
}

// Common Schemas
export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type Tokens = z.infer<typeof tokensSchema>;

const identifierSchema = z.object({ identifier: z.string().min(3) });
const passwordSchema = z.object({ password: z.string().min(6) });
const nameSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
const otpRequestSchema = identifierSchema.extend({ purpose: z.string() });
const otpVerifySchema = otpRequestSchema.extend({
  code: z.string().min(4).max(10),
});

// Responses
const checkIdentifierResponse = z.object({ exists: z.boolean() });
const otpRequestResponse = z.object({
  success: z.boolean(),
  devCode: z.string().optional(),
});
const loginResponse = z.object({ tokens: tokensSchema });

export async function checkIdentifier(identifier: string) {
  const id = isEmail(identifier) ? identifier : normalizePhone(identifier);
  return apiRequest<z.infer<typeof checkIdentifierResponse>, any>(
    "/auth/check-identifier",
    identifierSchema,
    checkIdentifierResponse,
    { body: { identifier: id } }
  );
}

export async function loginWithPassword(identifier: string, password: string) {
  const id = isEmail(identifier) ? identifier : normalizePhone(identifier);
  const res = await apiRequest<z.infer<typeof loginResponse>, any>(
    "/auth/login/password",
    identifierSchema.merge(passwordSchema),
    loginResponse,
    { body: { identifier: id, password } }
  );
  tokenStorage.set(res.tokens);
  return res.tokens;
}

export async function requestOtp(identifier: string, purpose: string) {
  const id = isEmail(identifier) ? identifier : normalizePhone(identifier);
  return apiRequest<z.infer<typeof otpRequestResponse>, any>(
    "/auth/otp/request",
    otpRequestSchema,
    otpRequestResponse,
    { body: { identifier: id, purpose } }
  );
}

export async function verifyOtp(
  identifier: string,
  purpose: string,
  code: string
) {
  const id = isEmail(identifier) ? identifier : normalizePhone(identifier);
  const res = await apiRequest<z.infer<typeof loginResponse>, any>(
    "/auth/otp/verify",
    otpVerifySchema,
    loginResponse,
    { body: { identifier: id, purpose, code } }
  );
  tokenStorage.set(res.tokens);
  return res.tokens;
}

export async function register(
  identifier: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const id = isEmail(identifier) ? identifier : normalizePhone(identifier);
  const res = await apiRequest<z.infer<typeof loginResponse>, any>(
    "/auth/register",
    identifierSchema.merge(passwordSchema).merge(nameSchema),
    loginResponse,
    { body: { identifier: id, password, firstName, lastName } }
  );
  tokenStorage.set(res.tokens);
  return res.tokens;
}

// Placeholders for future endpoints
export async function refresh() {
  const tokens = tokenStorage.get();
  if (!tokens) throw new ApiError("No refresh token", 401);
  // Will call /auth/refresh once backend implemented
  throw new ApiError("Not implemented", 501);
}

export async function logout() {
  tokenStorage.clear();
  // Will call backend /auth/logout to revoke refresh token and clear cookies
}

export async function me() {
  // Will call backend /auth/me using cookie access token (future) or attach bearer
  throw new ApiError("Not implemented", 501);
}
