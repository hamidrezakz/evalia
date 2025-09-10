// Zod for runtime schema validation
import { z } from "zod";
// Local storage abstraction for JWT tokens
import { tokenStorage } from "@/lib/token-storage";

// API response envelope schema (matches backend interceptor)
export const apiResponseSchema = z.object({
  success: z.boolean(),
  code: z.number(),
  message: z.string().nullable(),
  error: z.any().nullable(),
  data: z.any(),
  meta: z.any().nullable(),
  tookMs: z.number(),
});

// Generic API response type (typed data + meta)
export type ApiResponse<TData = unknown, TMeta = unknown> = z.infer<
  typeof apiResponseSchema
> & { data: TData; meta: TMeta | null };

// Standardized error for API/network/validation failures
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Default headers for all API requests
const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Options for apiRequest (method, body, headers, auth, refresh)
export interface RequestOptions<TBody> {
  method?: string;
  body?: TBody | null;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  auth?: boolean; // send Authorization header (default true)
  refreshOn401?: boolean; // auto refresh & retry once on 401 (default true)
  retry?: boolean; // internal flag to prevent infinite loops
}

// Typed pagination meta (extensible if backend adds more fields)
// Pagination meta info for list endpoints
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  [key: string]: any; // allow forward‑compat extra fields
}

// Helper list response type (inner data is an array + typed meta)
// Helper type for paginated list responses
export type ApiListResponse<
  TItem,
  M extends PaginationMeta = PaginationMeta
> = ApiResponse<TItem[], M>;

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
    // Expect same envelope; be defensive if backend not yet implemented consistent schema
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
async function ensureRefreshed(base: string): Promise<boolean> {
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

// Main API request function (validation, auth, refresh, error handling)
export async function apiRequest<TData = unknown, TBody = unknown>(
  path: string,
  bodySchema: z.ZodTypeAny | null,
  responseSchema: z.ZodTypeAny | null,
  options: RequestOptions<TBody> = {}
): Promise<ApiResponse<TData>> {
  // Ensure base URL has protocol; allow user to supply with or without protocol
  let rawBase = process.env.NEXT_PUBLIC_API_BASE || "api.evalia.ir";
  if (!/^https?:\/\//i.test(rawBase)) {
    rawBase = "https://" + rawBase.replace(/^\/+/, "");
  }
  // Remove trailing slash to avoid double slashes when concatenating path
  const base = rawBase.replace(/\/$/, "");
  const useAuth = options.auth !== false;
  const allowRefresh = options.refreshOn401 !== false;
  if (bodySchema && options.body) {
    const r = bodySchema.safeParse(options.body);
    if (!r.success)
      throw new ApiError("Body validation failed", 0, r.error.flatten());
  }
  const accessToken = (
    typeof window !== "undefined" && useAuth ? tokenStorage.get() : null
  )?.accessToken;
  const method = options.method || (options.body ? "POST" : "GET");
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
  let res: Response;
  try {
    res = await fetch(base + path, {
      method,
      headers,
      credentials: "include",
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (e) {
    if (
      typeof e === "object" &&
      e &&
      "name" in e &&
      (e as { name?: string }).name === "AbortError"
    )
      throw e;
    throw new ApiError(e instanceof Error ? e.message : "Network error", 0);
  }
  const raw = await res.text();
  let json: unknown = null;
  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  if (!res.ok) {
    if (res.status === 401 && useAuth && allowRefresh && !options.retry) {
      const refreshed = await ensureRefreshed(base);
      if (refreshed) {
        return apiRequest<TData, TBody>(path, bodySchema, responseSchema, {
          ...options,
          retry: true,
        });
      }
    }
    let message = raw || "Request failed";
    if (json && typeof json === "object") {
      const j = json as Record<string, unknown>;
      if (typeof j.message === "string") message = j.message;
      else if (typeof j.error === "string") message = j.error;
    }
    throw new ApiError(message, res.status, json);
  }
  const envelope = apiResponseSchema.safeParse(json);
  if (!envelope.success)
    throw new ApiError(
      "Response validation failed",
      res.status,
      envelope.error.flatten()
    );
  if (responseSchema) {
    // Validate the full envelope.data, not just envelope.data.data
    const inner = responseSchema.safeParse(envelope.data);
    if (!inner.success)
      throw new ApiError(
        "Inner data validation failed",
        res.status,
        inner.error.flatten()
      );
    return inner.data as ApiResponse<TData>;
  }
  return envelope.data as ApiResponse<TData>;
}

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

// Helper to extract typed data from ApiResponse
export function unwrap<T>(res: ApiResponse<T>): T {
  return res.data;
}

// HTTP verb shortcuts (keep full apiRequest for advanced use)
// HTTP verb shortcut methods (get, post, put, patch, delete)
export const http = {
  get: <T>(path: string, responseSchema: z.ZodTypeAny) =>
    apiRequest<T>(path, null, responseSchema),
  delete: <T>(path: string, responseSchema: z.ZodTypeAny) =>
    apiRequest<T>(path, null, responseSchema, { method: "DELETE" }),
  post: <T, B>(
    path: string,
    bodySchema: z.ZodTypeAny | null,
    responseSchema: z.ZodTypeAny,
    body: B
  ) =>
    apiRequest<T, B>(path, bodySchema, responseSchema, {
      method: "POST",
      body,
    }),
  put: <T, B>(
    path: string,
    bodySchema: z.ZodTypeAny | null,
    responseSchema: z.ZodTypeAny,
    body: B
  ) =>
    apiRequest<T, B>(path, bodySchema, responseSchema, { method: "PUT", body }),
  patch: <T, B>(
    path: string,
    bodySchema: z.ZodTypeAny | null,
    responseSchema: z.ZodTypeAny,
    body: B
  ) =>
    apiRequest<T, B>(path, bodySchema, responseSchema, {
      method: "PATCH",
      body,
    }),
};
