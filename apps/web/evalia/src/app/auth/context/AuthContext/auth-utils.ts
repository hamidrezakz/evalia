import { tokenStorage } from "@/lib/token-storage";
import { decodeAccessToken } from "@/lib/api.client";
import type { AccessTokenPayload, ActiveSelection } from "../auth-types";

export function persistKey(userId: number | null, suffix: string) {
  return userId ? `auth:${userId}:${suffix}` : `auth:anon:${suffix}`;
}

export function safeParseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function decodeToken(
  accessToken: string | null
): AccessTokenPayload | null {
  if (!accessToken) return null;
  return decodeAccessToken<AccessTokenPayload>();
}

export { tokenStorage };
