/**
 * Token storage abstraction. In production we will migrate to httpOnly cookies set by
 * Next.js route handlers proxying the backend. For now we keep localStorage behind an interface
 * so the rest of the app does not depend on the persistence mechanism.
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const tokenStorage = {
  get(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!access || !refresh) return null;
    return { accessToken: access, refreshToken: refresh };
  },
  set(tokens: AuthTokens) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    // Keep cookies in sync so Edge middleware can read them
    try {
      // JWTs are base64url-safe and can be stored as-is in cookies
      document.cookie = `${ACCESS_KEY}=${tokens.accessToken}; path=/; SameSite=Lax`;
      document.cookie = `${REFRESH_KEY}=${tokens.refreshToken}; path=/; SameSite=Lax`;
    } catch {
      // ignore cookie write errors in non-browser contexts
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    try {
      // Expire cookies so middleware stops seeing stale auth
      document.cookie = `${ACCESS_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
      document.cookie = `${REFRESH_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
    } catch {
      // ignore
    }
  },
};
