import { tokenStorage } from "@/lib/token-storage";

// Decodes JWT access token payload (no signature check)
export function decodeAccessToken<T = any>(): T | null {
  const token = tokenStorage.get()?.accessToken;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as T;
  } catch {
    return null;
  }
}
