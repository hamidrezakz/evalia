import { tokenStorage } from "@/lib/token-storage";

// Single-flight refresh token promise (prevents parallel refreshes)
let refreshInFlight: Promise<boolean> | null = null;

// Calls /auth/refresh and updates tokens if successful
async function performRefresh(base: string): Promise<boolean> {
  const tokens = tokenStorage.get();
  if (!tokens?.refreshToken) return false;
  try {
    const res = await fetch(base + "/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) return false;
    const txt = await res.text();
    if (!txt) return false;
    let json: any;
    try {
      json = JSON.parse(txt);
    } catch {
      return false;
    }
    const ok = json && typeof json === "object";
    const accessToken =
      json?.data?.tokens?.accessToken ||
      json?.accessToken ||
      json?.tokens?.accessToken;
    const refreshToken =
      json?.data?.tokens?.refreshToken ||
      json?.refreshToken ||
      json?.tokens?.refreshToken;
    if (ok && accessToken && refreshToken) {
      tokenStorage.set({ accessToken, refreshToken });
      return true;
    }
  } catch {
    /* ignore */
  }
  tokenStorage.clear();
  return false;
}

// Ensures only one refresh runs at a time
export async function ensureRefreshed(base: string): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh(base).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// Public helper so AuthContext (or other code) can proactively refresh tokens
export async function refreshTokens(): Promise<boolean> {
  let rawBase = process.env.NEXT_PUBLIC_API_BASE || "api.evalia.ir";
  if (!/^https?:\/\//i.test(rawBase)) {
    rawBase = "https://" + rawBase.replace(/^\/+/, "");
  }
  const base = rawBase.replace(/\/$/, "");
  return ensureRefreshed(base);
}
