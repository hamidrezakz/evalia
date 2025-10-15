import { z } from "zod";
import { apiResponseSchema } from "./schema";
import { ApiError } from "./error";
import { ensureRefreshed } from "./refresh";
import { tokenStorage } from "@/lib/token-storage";
import { ApiResponse, RequestOptions } from "./types";
import {
  notifyError,
  notifySuccess,
  notifyWarning,
  notifyInfo,
} from "@/lib/notifications";

// Default headers for all API requests
const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Main API request function (validation, auth, refresh, error handling)
export async function apiRequest<TData = unknown, TBody = unknown>(
  path: string,
  bodySchema: z.ZodTypeAny | null,
  responseSchema: z.ZodTypeAny | null,
  options: RequestOptions<TBody> = {}
): Promise<ApiResponse<TData>> {
  // Default fallback domain adjusted to production API domain
  let rawBase = process.env.NEXT_PUBLIC_API_BASE || "api.doneplay.site";
  if (!/^https?:\/\//i.test(rawBase)) {
    rawBase = "https://" + rawBase.replace(/^\/+/, "");
  }
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
    // Error toast level mapping by status
    const s = res.status;
    const isWarning = [400, 404, 409, 422, 429].includes(s);
    if (isWarning) notifyWarning(message);
    else notifyError(message);
    throw new ApiError(message, res.status, json);
  }
  const envelope = apiResponseSchema.safeParse(json);
  if (!envelope.success)
    throw new ApiError(
      "Response validation failed",
      res.status,
      envelope.error.flatten()
    );
  // Only validate inner data if responseSchema is provided, without manipulating the structure
  if (responseSchema) {
    const inner = responseSchema.safeParse(envelope.data.data);
    if (!inner.success) {
      notifyError("Inner data validation failed");
      throw new ApiError(
        "Inner data validation failed",
        res.status,
        inner.error.flatten()
      );
    }
    // Attach validated inner data back to envelope
    const resp = { ...envelope.data, data: inner.data } as ApiResponse<TData>;
    // Success toast (message-only). Allow backend to hint type via meta
    const serverMsg = envelope.data.message;
    if (typeof serverMsg === "string" && serverMsg.trim().length > 0) {
      const meta: any = (envelope.data as any).meta;
      const toastType = meta?.toastType || meta?.severity || meta?.toast?.type;
      if (toastType === "warning") notifyWarning(serverMsg);
      else if (toastType === "info") notifyInfo(serverMsg);
      else notifySuccess(serverMsg);
    }
    return resp;
  }
  // Always return the full envelope object
  const serverMsg = envelope.data.message;
  if (typeof serverMsg === "string" && serverMsg.trim().length > 0) {
    const meta: any = (envelope.data as any).meta;
    const toastType = meta?.toastType || meta?.severity || meta?.toast?.type;
    if (toastType === "warning") notifyWarning(serverMsg);
    else if (toastType === "info") notifyInfo(serverMsg);
    else notifySuccess(serverMsg);
  }
  return envelope.data as ApiResponse<TData>;
}
