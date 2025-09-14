import { jwtDecode } from "jwt-decode";

/**
 * Decodes JWT payload using jwt-decode library (no signature verification).
 * Safe for NON-SECURITY decisions like: exp based refresh scheduling, optimistic UI.
 * NEVER trust roles / permissions from this result without server confirmation.
 */
export function decodeJwtRaw<T = any>(token: string): T | null {
  if (!token) return null;
  try {
    return jwtDecode<T>(token);
  } catch {
    return null;
  }
}

/** Convenience helper to read exp (unix seconds) safely */
export function getJwtExp(token: string): number | null {
  const p = decodeJwtRaw<any>(token);
  return p && typeof p.exp === "number" ? p.exp : null;
}
