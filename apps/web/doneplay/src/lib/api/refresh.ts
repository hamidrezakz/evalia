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
    let json: unknown;
    try {
      json = JSON.parse(txt);
    } catch {
      return false;
    }
    const ok = json && typeof json === "object";
    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    if (ok) {
      const obj = json as Record<string, unknown>;
      // Try nested data.tokens
      if (
        "data" in obj &&
        typeof obj.data === "object" &&
        obj.data !== null &&
        "tokens" in (obj.data as Record<string, unknown>) &&
        typeof (obj.data as Record<string, unknown>).tokens === "object" &&
        (obj.data as Record<string, unknown>).tokens !== null
      ) {
        const tokensObj = (obj.data as Record<string, unknown>)
          .tokens as Record<string, unknown>;
        accessToken =
          typeof tokensObj.accessToken === "string"
            ? tokensObj.accessToken
            : undefined;
        refreshToken =
          typeof tokensObj.refreshToken === "string"
            ? tokensObj.refreshToken
            : undefined;
      }
      // Try top-level tokens
      if (
        !accessToken &&
        "tokens" in obj &&
        typeof obj.tokens === "object" &&
        obj.tokens !== null
      ) {
        const tokensObj = obj.tokens as Record<string, unknown>;
        accessToken =
          typeof tokensObj.accessToken === "string"
            ? tokensObj.accessToken
            : undefined;
        refreshToken =
          typeof tokensObj.refreshToken === "string"
            ? tokensObj.refreshToken
            : undefined;
      }
      // Try top-level accessToken/refreshToken
      if (
        !accessToken &&
        "accessToken" in obj &&
        typeof obj.accessToken === "string"
      ) {
        accessToken = obj.accessToken;
      }
      if (
        !refreshToken &&
        "refreshToken" in obj &&
        typeof obj.refreshToken === "string"
      ) {
        refreshToken = obj.refreshToken;
      }
    }
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
  let rawBase = process.env.NEXT_PUBLIC_API_BASE || "api.doneplay.site";
  if (!/^https?:\/\//i.test(rawBase)) {
    rawBase = "https://" + rawBase.replace(/^\/+/, "");
  }
  const base = rawBase.replace(/\/$/, "");
  return ensureRefreshed(base);
}
