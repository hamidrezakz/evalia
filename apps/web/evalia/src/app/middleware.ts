import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwtRaw } from "@/lib/jwt-utils";

/**
 * Professional Auth Middleware (Edge)
 * --------------------------------------------------
 * Responsibilities:
 * 1. Enforce auth for protected routes before any application code executes.
 * 2. Parse + minimally validate access token structure (presence of sub & exp, non-expired).
 * 3. Attempt a single silent refresh (using refreshToken) when token is expired or nearing expiry.
 * 4. Redirect anonymous / invalid sessions to /auth?redirect=original-path.
 * 5. Fail closed: malformed / tampered tokens are treated as unauthenticated (never passed through).
 *
 * Design Principles:
 * - Edge runtime must stay fast: only one network call (refresh) per request at most.
 * - Defensive parsing: decode WITHOUT trusting payload claims for authorization (server still re-verifies).
 * - Avoid infinite loops: on refresh failure we clear cookies before redirecting.
 * - Keep logic deterministic and side-effect minimal.
 *
 * Future Hardening (Recommended):
 * - Issue httpOnly; Secure; SameSite=Strict cookies from backend (remove any localStorage coupling).
 * - Add a lightweight /auth/session endpoint for tokenVersion / revocation checks (conditional revalidate).
 * - Enforce role / scope pre-checks here only if they can be derived cheaply & safely.
 * - Introduce anomaly detection (e.g., missing exp/sub frequency logging) via telemetry.
 */

// Public (unauthenticated) routes; everything else is guarded.
const PUBLIC_ROUTES = ["/", "/auth"];

// Proactive refresh threshold (seconds before actual exp)
const REFRESH_LEEWAY_SECONDS = 60; // 1 minute

// Minimal shape expected in an access token (after decoding, before trusting)
interface MinimalAccessPayload {
  sub: string;
  exp: number;
  [k: string]: any; // allow extra claims transparently
}

// Utility: centralized redirect builder.
function buildLoginRedirect(req: NextRequest): NextResponse {
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/auth";
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname || "/");
  return NextResponse.redirect(loginUrl);
}

// Utility: set new auth cookies (non-httpOnly here; future: move issuance server-side with httpOnly)
function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  res.cookies.set("accessToken", accessToken, { path: "/" });
  res.cookies.set("refreshToken", refreshToken, { path: "/" });
}

// Utility: clear auth cookies defensively (prevents loops when tokens invalid / refresh fails)
function clearAuthCookies(res: NextResponse) {
  res.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
  res.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
}

// Validate structural integrity of token (NON-cryptographic; server still verifies signature later)
function validateAccessToken(raw?: string): {
  valid: boolean;
  payload?: MinimalAccessPayload;
  expired?: boolean;
} {
  if (!raw) return { valid: false };
  const decoded = decodeJwtRaw<Partial<MinimalAccessPayload>>(raw) || {};
  const exp = typeof decoded.exp === "number" ? decoded.exp : undefined;
  const sub = typeof decoded.sub === "string" ? decoded.sub : undefined;
  if (!exp || !sub) return { valid: false };
  const now = Math.floor(Date.now() / 1000);
  const expired = exp <= now;
  return { valid: !expired, payload: decoded as MinimalAccessPayload, expired };
}

async function attemptServerRefresh(
  req: NextRequest
): Promise<{ accessToken?: string; refreshToken?: string } | null> {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return null;
  let rawBase = process.env.NEXT_PUBLIC_API_BASE || "api.evalia.ir";
  if (!/^https?:\/\//i.test(rawBase))
    rawBase = "https://" + rawBase.replace(/^\/+/, "");
  const base = rawBase.replace(/\/$/, "");
  try {
    const res = await fetch(base + "/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const txt = await res.text();
    if (!txt) return null;
    let json: any;
    try {
      json = JSON.parse(txt);
    } catch {
      return null;
    }
    // Accept flexible shapes like client code
    let accessToken: string | undefined;
    let newRefreshToken: string | undefined;
    const tryExtract = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (typeof obj.accessToken === "string")
        accessToken = accessToken || obj.accessToken;
      if (typeof obj.refreshToken === "string")
        newRefreshToken = newRefreshToken || obj.refreshToken;
      if (obj.tokens && typeof obj.tokens === "object") tryExtract(obj.tokens);
      if (obj.data && typeof obj.data === "object") tryExtract(obj.data);
    };
    tryExtract(json);
    if (accessToken && newRefreshToken)
      return { accessToken, refreshToken: newRefreshToken };
    return null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip framework / static assets early.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // 2. Allow explicitly public routes.
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Structural validation of access token.
  const rawAccess = req.cookies.get("accessToken")?.value;
  const accessValidation = validateAccessToken(rawAccess);

  // 3a. No token / malformed token => redirect.
  if (!accessValidation.valid && !accessValidation.expired) {
    // Invalid structure (e.g., missing sub/exp) -> treat as anonymous
    const res = buildLoginRedirect(req);
    clearAuthCookies(res);
    return res;
  }

  // 4. Expired token path: attempt refresh (hard requirement).
  if (accessValidation.expired) {
    const refreshed = await attemptServerRefresh(req);
    if (!refreshed) {
      const res = buildLoginRedirect(req);
      clearAuthCookies(res); // prevent redirect loop with stale cookies
      return res;
    }
    const res = NextResponse.next();
    setAuthCookies(res, refreshed.accessToken!, refreshed.refreshToken!);
    return res;
  }

  // At this point token structurally OK and not expired.
  const exp = accessValidation.payload!.exp;
  const now = Math.floor(Date.now() / 1000);

  // 5. Proactive refresh branch (best-effort, non-blocking on failure).
  if (exp - now <= REFRESH_LEEWAY_SECONDS) {
    const refreshed = await attemptServerRefresh(req);
    if (refreshed) {
      const res = NextResponse.next();
      setAuthCookies(res, refreshed.accessToken!, refreshed.refreshToken!);
      return res;
    }
  }

  // 6. Pass through for valid session.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|fonts|images).*)"],
};
