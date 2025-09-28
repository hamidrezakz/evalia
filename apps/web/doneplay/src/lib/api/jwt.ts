import { tokenStorage } from "@/lib/token-storage";
import { decodeJwtRaw } from "@/lib/jwt-utils";

// Decodes JWT access token payload (no signature check)
export function decodeAccessToken<T = unknown>(): T | null {
  const token = tokenStorage.get()?.accessToken;
  if (!token) return null;
  return decodeJwtRaw<T>(token);
}
