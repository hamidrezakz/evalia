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
  type CheckIdentifierData,
  type OtpRequestData,
  type VerifyOtpData,
  type LoginPasswordData,
  type CompleteRegistrationData,
} from "./auth.types";

// Keep email vs phone discrimination helper local (not exported)
function isEmail(str: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str);
}

function toPhone(value: string) {
  // If email stays email (for future email login) else normalize phone
  if (isEmail(value)) return value; // placeholder (backend phone-only now)
  return normalizePhone(value);
}

export async function checkIdentifier(phoneRaw: string) {
  const phone = toPhone(phoneRaw);
  return apiRequest<CheckIdentifierData, { phone: string }>(
    "/auth/check-identifier",
    phoneSchema,
    checkIdentifierDataSchema,
    { body: { phone }, auth: false }
  );
}

export async function loginWithPassword(phoneRaw: string, password: string) {
  const phone = toPhone(phoneRaw);
  const res = await apiRequest<
    LoginPasswordData,
    { phone: string; password: string }
  >(
    "/auth/login/password",
    phoneSchema.merge(passwordSchema),
    loginPasswordDataSchema,
    { body: { phone, password } }
  );
  tokenStorage.set(res.data.tokens);
  return res;
}

export async function requestOtp(phoneRaw: string, purpose: string) {
  const phone = toPhone(phoneRaw);
  return apiRequest<OtpRequestData, { phone: string; purpose: string }>(
    "/auth/otp/request",
    otpRequestSchema,
    otpRequestDataSchema,
    { body: { phone, purpose } }
  );
}

export async function verifyOtp(
  phoneRaw: string,
  purpose: string,
  code: string
) {
  const phone = toPhone(phoneRaw);
  const res = await apiRequest<
    VerifyOtpData,
    { phone: string; purpose: string; code: string }
  >("/auth/otp/verify", otpVerifySchema, verifyOtpDataSchema, {
    body: { phone, purpose, code },
  });
  if (res.data.mode === "LOGIN") {
    tokenStorage.set(res.data.tokens);
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
    { body: { signupToken, firstName, lastName, password } }
  );
  tokenStorage.set(res.data.tokens);
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
