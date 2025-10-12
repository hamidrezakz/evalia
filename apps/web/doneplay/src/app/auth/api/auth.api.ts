import { apiRequest } from "@/lib/api.client";
import { tokenStorage } from "@/lib/token-storage";
import { normalizePhone } from "@/lib/normalize-phone";
import {
  phoneSchema,
  passwordSchema,
  otpRequestSchema,
  otpVerifySchema,
  completeRegistrationSchema,
  checkIdentifierDataSchema,
  otpRequestDataSchema,
  verifyOtpDataSchema,
  loginPasswordDataSchema,
  completeRegistrationDataSchema,
  resetPasswordDataSchema,
  type CheckIdentifierData,
  type OtpRequestData,
  type VerifyOtpData,
  type LoginPasswordData,
  type CompleteRegistrationData,
  type ResetPasswordData,
} from "./auth.types";
// import { z } from "zod"; // Removed unused import

/**
 * Auth API design goals:
 * - Pure functions (fetch layer) separated from potential React hooks.
 * - Full runtime validation for request body (via passed schema) & response inner data.
 * - Unified, cache-friendly query/mutation keys for React Query use.
 * - Minimal surface (only actively used endpoints) – future endpoints live elsewhere.
 */

// Helpers -------------------------------------------------------------
function isEmail(str: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str);
}
function toPhone(identifier: string) {
  if (isEmail(identifier)) return identifier; // placeholder for future dual-mode
  return normalizePhone(identifier);
}

// Query / Mutation Keys (React Query friendly) -----------------------
export const authKeys = {
  root: ["auth"] as const,
  identifier: (identifier: string) =>
    ["auth", "identifier", identifier] as const, // checkIdentifier
  // Mutations (convention: start with 'm:')
  mLogin: () => ["auth", "m", "login"] as const,
  mOtpRequest: () => ["auth", "m", "otpRequest"] as const,
  mOtpVerify: () => ["auth", "m", "otpVerify"] as const,
  mCompleteRegistration: () => ["auth", "m", "completeRegistration"] as const,
  mResetPassword: () => ["auth", "m", "resetPassword"] as const,
};

// Core API functions --------------------------------------------------
export async function checkIdentifier(phoneOrEmailRaw: string) {
  const phone = toPhone(phoneOrEmailRaw);
  const res = await apiRequest<CheckIdentifierData, { phone: string }>(
    "/auth/check-identifier",
    phoneSchema,
    checkIdentifierDataSchema,
    { body: { phone }, auth: false }
  );
  return res;
}

export async function loginWithPassword(
  identifierRaw: string,
  password: string,
  orgSlug?: string | null
) {
  const phone = toPhone(identifierRaw);
  const res = await apiRequest<
    LoginPasswordData,
    { phone: string; password: string }
  >(
    "/auth/login/password",
    phoneSchema.merge(passwordSchema),
    loginPasswordDataSchema,
    { body: { phone, password, ...(orgSlug ? { orgSlug } : {}) } }
  );
  tokenStorage.set(res.data.tokens);
  return res;
}

export async function requestOtp(identifierRaw: string, purpose: string) {
  const phone = toPhone(identifierRaw);
  const res = await apiRequest<
    OtpRequestData,
    { phone: string; purpose: string }
  >("/auth/otp/request", otpRequestSchema, otpRequestDataSchema, {
    body: { phone, purpose },
    auth: false,
  });
  return res;
}

export async function verifyOtp(
  identifierRaw: string,
  purpose: string,
  code: string,
  orgSlug?: string | null
) {
  const phone = toPhone(identifierRaw);
  const res = await apiRequest<
    VerifyOtpData,
    { phone: string; purpose: string; code: string }
  >("/auth/otp/verify", otpVerifySchema, verifyOtpDataSchema, {
    body: { phone, purpose, code, ...(orgSlug ? { orgSlug } : {}) },
  });
  if (res.data.mode === "LOGIN") tokenStorage.set(res.data.tokens);
  return res;
}

export async function completeRegistration(
  signupToken: string,
  firstName: string,
  lastName: string,
  password: string,
  orgSlug?: string | null
) {
  const res = await apiRequest<
    CompleteRegistrationData,
    {
      signupToken: string;
      firstName: string;
      lastName: string;
      password: string;
    }
  >(
    "/auth/complete-registration",
    completeRegistrationSchema,
    completeRegistrationDataSchema,
    {
      body: {
        signupToken,
        firstName,
        lastName,
        password,
        ...(orgSlug ? { orgSlug } : {}),
      },
    }
  );
  tokenStorage.set(res.data.tokens);
  return res;
}

export async function resetPassword(
  identifierRaw: string,
  code: string,
  newPassword: string
) {
  const phone = toPhone(identifierRaw);
  const res = await apiRequest<
    ResetPasswordData,
    { phone: string; code: string; newPassword: string }
  >(
    "/auth/reset-password",
    // Basic validation: reuse phone & compose fields inline
    phoneSchema.extend({
      code: otpVerifySchema.shape.code,
      newPassword: passwordSchema.shape.password,
    }),
    resetPasswordDataSchema,
    { body: { phone, code, newPassword }, auth: false }
  );
  tokenStorage.set(res.data.tokens);
  return res;
}

// Facade / OO style (optional) ---------------------------------------
export class AuthApiClient {
  checkIdentifier = checkIdentifier;
  loginWithPassword = loginWithPassword;
  requestOtp = requestOtp;
  verifyOtp = verifyOtp;
  completeRegistration = completeRegistration;
  resetPassword = resetPassword;
}

/**
 * NOTE: Future endpoints (refresh, logout, me, email-based flows) should live in a separate file
 * (e.g., auth.api.future.ts) to keep this module lean and highly tree-shakable.
 */
