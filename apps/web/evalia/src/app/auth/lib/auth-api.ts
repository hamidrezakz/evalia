import { z } from "zod";
import { apiRequest } from "@/lib/api-client";
import { tokenStorage } from "@/lib/token-storage";
import { normalizePhone } from "@/lib/normalize-phone";

// Helper discriminators
function isEmail(str: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str);
}

// Tokens
export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type Tokens = z.infer<typeof tokensSchema>;

// Backend uses pure phone (email login separate later) so we keep phone-centric schema
const phoneSchema = z.object({ phone: z.string().min(9) });
const passwordSchema = z.object({ password: z.string().min(6) });
const otpRequestSchema = z.object({ phone: z.string(), purpose: z.string() });
const otpVerifySchema = otpRequestSchema.extend({
  code: z.string().min(6).max(6),
});
const completeRegistrationSchema = z.object({
  signupToken: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6),
});

// Responses (align to backend: {exists}, {ok, devCode}, verify: either login or signupToken)
const checkIdentifierResponse = z.object({ exists: z.boolean() });
const otpRequestResponse = z.object({
  ok: z.boolean(),
  devCode: z.string().optional(),
});
const completeRegistrationResponse = z.object({
  user: z.object({
    id: z.number(),
    email: z.string().nullable().optional(),
    phone: z.string(),
    fullName: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
  }),
  tokens: tokensSchema,
});

// verifyOtp backend: existing user -> {user, tokens, mode: 'LOGIN'} OR new -> {signupToken, mode: 'SIGNUP'}
const verifyOtpLoginResponse = z.object({
  user: completeRegistrationResponse.shape.user,
  tokens: tokensSchema,
  mode: z.literal("LOGIN"),
});
const verifyOtpSignupResponse = z.object({
  signupToken: z.string(),
  mode: z.literal("SIGNUP"),
});
const verifyOtpResponse = z.union([
  verifyOtpLoginResponse,
  verifyOtpSignupResponse,
]);

// password login & email login shape reuse
const loginResponse = z.object({
  user: completeRegistrationResponse.shape.user,
  tokens: tokensSchema,
});

function toPhone(value: string) {
  // If email stays email (for future email login) else normalize phone
  if (isEmail(value)) return value; // placeholder (backend phone-only now)
  return normalizePhone(value);
}

export async function checkIdentifier(phoneRaw: string) {
  const phone = toPhone(phoneRaw);
  return apiRequest<z.infer<typeof checkIdentifierResponse>, { phone: string }>(
    "/auth/check-identifier",
    phoneSchema,
    checkIdentifierResponse,
    { body: { phone } }
  );
}

export async function loginWithPassword(phoneRaw: string, password: string) {
  const phone = toPhone(phoneRaw);
  const res = await apiRequest<
    z.infer<typeof loginResponse>,
    { phone: string; password: string }
  >("/auth/login/password", phoneSchema.merge(passwordSchema), loginResponse, {
    body: { phone, password },
  });
  tokenStorage.set(res.tokens);
  return res;
}

export async function requestOtp(phoneRaw: string, purpose: string) {
  const phone = toPhone(phoneRaw);
  return apiRequest<
    z.infer<typeof otpRequestResponse>,
    { phone: string; purpose: string }
  >("/auth/otp/request", otpRequestSchema, otpRequestResponse, {
    body: { phone, purpose },
  });
}

export async function verifyOtp(
  phoneRaw: string,
  purpose: string,
  code: string
) {
  const phone = toPhone(phoneRaw);
  const res = await apiRequest<
    z.infer<typeof verifyOtpResponse>,
    { phone: string; purpose: string; code: string }
  >("/auth/otp/verify", otpVerifySchema, verifyOtpResponse, {
    body: { phone, purpose, code },
  });
  if (res.mode === "LOGIN") {
    tokenStorage.set(res.tokens);
  }
  return res;
}

export async function completeRegistration(
  signupToken: string,
  firstName: string,
  lastName: string,
  password: string
) {
  const res = await apiRequest<
    z.infer<typeof completeRegistrationResponse>,
    {
      signupToken: string;
      firstName: string;
      lastName: string;
      password: string;
    }
  >(
    "/auth/complete-registration",
    completeRegistrationSchema,
    completeRegistrationResponse,
    { body: { signupToken, firstName, lastName, password } }
  );
  tokenStorage.set(res.tokens);
  return res;
}
/**
 * NOTE: This file intentionally only exports the functions currently used by the login/onboarding flow:
 *  - checkIdentifier
 *  - loginWithPassword
 *  - requestOtp
 *  - verifyOtp
 *  - completeRegistration
 *
 * Any future endpoints (email login, refresh token handling, logout, me profile, etc.) were moved to a
 * separate placeholder file (auth-api.future.ts) to keep the active surface minimal & maintainable.
 * This helps tree‑shaking, reduces cognitive load, and makes it obvious what is really in use.
 */
