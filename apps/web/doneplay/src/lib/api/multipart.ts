import { z } from "zod";
import { apiResponseSchema } from "./schema";
import { ensureRefreshed } from "./refresh";
import { tokenStorage } from "@/lib/token-storage";
import { resolveApiBase } from "./helpers";
import type { ApiResponse } from "./types";
import { notifySuccess } from "@/lib/notifications";

type MultipartOptions = {
  headers?: Record<string, string>;
  auth?: boolean; // default true
  refreshOn401?: boolean; // default true
  retry?: boolean; // internal
};

export async function apiRequestMultipart<TData = unknown>(
  path: string,
  formData: FormData,
  responseSchema: z.ZodTypeAny | null = null,
  options: MultipartOptions = {}
): Promise<ApiResponse<TData>> {
  const base = resolveApiBase();
  const useAuth = options.auth !== false;
  const allowRefresh = options.refreshOn401 !== false;
  const accessToken = (
    typeof window !== "undefined" && useAuth ? tokenStorage.get() : null
  )?.accessToken;
  const headers: Record<string, string> = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const doFetch = async (): Promise<Response> =>
    fetch(base + path, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    });

  let res: Response;
  try {
    res = await doFetch();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    throw new Error(msg);
  }

  if (res.status === 401 && useAuth && allowRefresh && !options.retry) {
    const refreshed = await ensureRefreshed(base);
    if (refreshed) {
      return apiRequestMultipart<TData>(path, formData, responseSchema, {
        ...options,
        retry: true,
      });
    }
  }

  const raw = await res.text();
  let json: any = null;
  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {}
  }

  if (!res.ok) {
    const msg = json?.message || json?.error || raw || "Request failed";
    const err = new Error(msg);
    (err as any).status = res.status;
    throw err;
  }

  const envelope = apiResponseSchema.safeParse(json);
  if (!envelope.success) {
    throw new Error("Response validation failed: " + envelope.error.message);
  }

  if (responseSchema) {
    // Try to validate inner data; api envelope shape is consistent: { data: any }
    const inner = (envelope.data as any).data;
    const parsed = responseSchema.safeParse(inner);
    if (!parsed.success) {
      throw new Error("Inner data validation failed: " + parsed.error.message);
    }
    const result = {
      ...(envelope.data as any),
      data: parsed.data,
    } as ApiResponse<TData>;
    try {
      const serverMsg = (envelope.data as any)?.message as
        | string
        | null
        | undefined;
      notifySuccess(String(serverMsg || "با موفقیت آپلود شد"));
    } catch {}
    return result;
  }
  try {
    const serverMsg = (envelope.data as any)?.message as
      | string
      | null
      | undefined;
    notifySuccess(String(serverMsg || "با موفقیت آپلود شد"));
  } catch {}
  return envelope.data as ApiResponse<TData>;
}
