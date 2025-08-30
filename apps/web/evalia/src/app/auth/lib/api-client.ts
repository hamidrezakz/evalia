import { z } from "zod";

/**
 * Centralized API client for frontend -> backend calls.
 * Handles base URL resolution, JSON parsing, error normalization, aborts, and typed responses.
 */
export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(message: string, status: number, details?: any) {
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
  } catch (e: any) {
    if (e.name === "AbortError") throw e;
    throw new ApiError(e.message || "Network error", 0);
  }

  let json: any = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // ignore malformed JSON
    }
  }

  if (!res.ok) {
    const message = json?.message || json?.error || text || "Request failed";
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
