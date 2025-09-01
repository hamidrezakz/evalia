// Future / planned auth endpoints & ideas.
// Keeping them out of the main auth-api.ts to reduce noise until actually implemented.

import { z } from "zod";
import { apiRequest, ApiError } from "@/lib/api-client";
import { tokenStorage } from "@/lib/token-storage";

// Shared schemas from current implementation could be optionally re-exported or refactored later.
// For now we redefine only what's necessary when implementing.

// Example (unimplemented) email login
// export async function loginWithEmail(email: string, password: string) {
//   const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
//   const response = z.object({ user: z.any(), tokens: z.any() }); // refine when backend spec is ready
//   const res = await apiRequest<any, { email: string; password: string }>(
//     "/auth/login/email",
//     schema,
//     response,
//     { body: { email, password } }
//   );
//   tokenStorage.set(res.tokens);
//   return res;
// }

// Refresh token handling (to be integrated with an interceptor style approach later)
// export async function refresh() {
//   const tokens = tokenStorage.get();
//   if (!tokens?.refreshToken) throw new ApiError("No refresh token", 401);
//   // call backend refresh endpoint when defined
//   throw new ApiError("Not implemented", 501);
// }

// export async function logout() {
//   tokenStorage.clear();
//   // optionally notify backend to invalidate refresh token
// }

// export async function me() {
//   // would fetch current user details. Consider SSR integration or React Query usage.
//   throw new ApiError("Not implemented", 501);
// }

/**
 * Implementation notes / roadmap:
 * 1. When adding refresh logic, consider a lightweight token refresh wrapper instead of sprinkling refresh calls.
 * 2. For 'me' endpoint, prefer a React Query useMe() hook that caches user info globally.
 * 3. Email login can share most of the phone login flow—abstract the common token handling.
 * 4. Keep auth-api.ts minimal: only production-used, stable endpoints.
 */
