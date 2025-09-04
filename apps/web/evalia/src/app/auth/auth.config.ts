// Centralized auth-related constants & helpers
export const AUTH_CACHE = {
  IDENTIFIER_STALE: 60_000, // 1 min
  IDENTIFIER_GC: 5 * 60_000, // 5 min
};

export const AUTH_PURPOSE = {
  LOGIN: "LOGIN",
  // Future: PASSWORD_RESET: 'PASSWORD_RESET', EMAIL_VERIFY: 'EMAIL_VERIFY'
} as const;

export const PASSWORD = {
  MIN_LENGTH: 6,
};

export type AuthPurpose = (typeof AUTH_PURPOSE)[keyof typeof AUTH_PURPOSE];
