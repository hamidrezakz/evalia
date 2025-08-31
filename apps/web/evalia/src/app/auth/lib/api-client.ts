import { z } from "zod";

/**
 * Centralized API client for frontend -> backend calls.
 * Handles base URL resolution, JSON parsing, error normalization, aborts, and typed responses.
 */
export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export interface RequestOptions<TBody> {
  method?: string;
  body?: TBody | null;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  auth?: boolean; // reserved for future cookie / bearer logic
}

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  bodySchema: z.ZodTypeAny | null,
  responseSchema: z.ZodTypeAny,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  if (bodySchema && options.body) {
    const parse = bodySchema.safeParse(options.body);
    if (!parse.success) {
      throw new ApiError("Body validation failed", 0, parse.error.flatten());
    }
  }

  const controller = new AbortController();
  const signal = options.signal || controller.signal;
  const method = options.method || (options.body ? "POST" : "GET");

  const fetchPromise = fetch(base + path, {
    method,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal,
  });

  let res: Response;
  try {
    res = await fetchPromise;
  } catch (e) {
    if (
      typeof e === "object" &&
      e !== null &&
      "name" in e &&
      (e as { name?: unknown }).name === "AbortError"
    )
      throw e;
    const err = e instanceof Error ? e : new Error(String(e));
    throw new ApiError(err.message || "Network error", 0);
  }

  let json: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // ignore malformed JSON
    }
  }

  if (!res.ok) {
    let message = text || "Request failed";
    if (json && typeof json === "object") {
      const j: Record<string, unknown> = json as Record<string, unknown>;
      if (typeof j.message === "string") message = j.message;
      else if (typeof j.error === "string") message = j.error;
    }
    throw new ApiError(message, res.status, json);
  }

  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(
      "Response validation failed",
      res.status,
      parsed.error.flatten()
    );
  }
  return parsed.data as TResponse;
}
