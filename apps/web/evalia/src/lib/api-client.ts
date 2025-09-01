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

/**
 * مقایسه Error معمولی و ApiError سفارشی در پروژه:
 *
 * // استفاده از Error معمولی:
 * try {
 *   throw new Error("مشکلی پیش آمد");
 * } catch (e) {
 *   console.log(e.message); // فقط پیام خطا
 *   // اطلاعاتی مثل status یا جزئیات بیشتر نداری
 * }
 *
 * // استفاده از ApiError سفارشی:
 * try {
 *   throw new ApiError("توکن منقضی شده", 401, { token: "expired" });
 * } catch (e) {
 *   if (e instanceof ApiError) {
 *     console.log(e.message); // پیام خطا
 *     console.log(e.status);  // کد وضعیت (مثلاً 401)
 *     console.log(e.details); // جزئیات اضافی (مثلاً اطلاعات ولیدیشن)
 *   }
 * }
 *
 * // نتیجه:
 * // - Error معمولی فقط پیام دارد و برای خطاهای ساده مناسب است.
 * // - ApiError برای مدیریت حرفه‌ای خطاهای API، داشتن اطلاعات بیشتر و کنترل بهتر ضروری است.
 * // - همیشه در پروژه‌های واقعی بهتر است از کلاس خطای سفارشی مثل ApiError استفاده شود.
 */

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * مقایسه درخواست عادی و استفاده از defaultHeaders:
 *
 * // درخواست عادی (بدون متغیر پیش‌فرض):
 * fetch("/api/some-endpoint", {
 *   method: "POST",
 *   headers: {
 *     "Content-Type": "application/json",
 *     Accept: "application/json",
 *     Authorization: "Bearer xyz", // اگر لازم باشد
 *   },
 *   body: JSON.stringify({ foo: "bar" }),
 * });
 *
 * // درخواست با defaultHeaders:
 * fetch("/api/some-endpoint", {
 *   method: "POST",
 *   headers: { ...defaultHeaders, Authorization: "Bearer xyz" },
 *   body: JSON.stringify({ foo: "bar" }),
 * });
 *
 * // نتیجه:
 * // - هدرهای اصلی همیشه به صورت پیش‌فرض اضافه می‌شوند.
 * // - فقط هدرهای خاص (مثلاً Authorization) را اضافه می‌کنی.
 * // - کد تمیزتر، کوتاه‌تر و بدون تکرار است.
 */

export interface RequestOptions<TBody> {
  method?: string;
  body?: TBody | null;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  auth?: boolean; // reserved for future cookie / bearer logic
}

/**
 * مقایسه استفاده از RequestOptions با حالت عادی:
 *
 * // حالت عادی (بدون اینترفیس):
 * fetch("/api/endpoint", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ foo: "bar" }),
 *   // اگر بخواهی کنسل کنی یا هدر خاص اضافه کنی باید دستی اضافه کنی
 * });
 * // هیچ قراردادی برای ورودی‌ها وجود ندارد و تایپ‌چک نمی‌شود.
 *
 * // با استفاده از RequestOptions:
 * const options: RequestOptions<{ foo: string }> = {
 *   method: "POST",
 *   body: { foo: "bar" },
 *   headers: { Authorization: "Bearer xyz" },
 *   signal: new AbortController().signal,
 * };
 * // همه گزینه‌ها تایپ‌چک می‌شوند و توسعه‌پذیری بالاتر است.
 *
 * // چرا نوشتیمش؟
 * // - برای استانداردسازی و امن کردن ورودی‌های apiRequest
 * // - جلوگیری از اشتباهات تایپی و افزایش خوانایی
 * // - توسعه‌پذیری و افزودن راحت قابلیت‌های جدید
 */

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  bodySchema: z.ZodTypeAny | null,
  responseSchema: z.ZodTypeAny,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "api.evalia.ir";
  if (bodySchema && options.body) {
    /**
     * zod's safeParse: runtime validation of the request body against the schema
     * Input: the actual data to be sent (e.g., { phone, password })
     * Output: { success: true, data: ... } if valid
     *         { success: false, error: ... } if invalid (includes validation details)
     * Does NOT throw exceptions; just returns the result (unlike parse, which throws)
     * Here, if success=false, we throw a custom error with validation details
     */
    const parse = bodySchema.safeParse(options.body);
    if (!parse.success) {
      throw new ApiError("Body validation failed", 0, parse.error.flatten());
    }
  }

  const controller = new AbortController();
  const signal = options.signal || controller.signal;
  const method = options.method || (options.body ? "POST" : "GET");
  /**
   * Example: How to use AbortController, signal, and custom HTTP method with apiRequest
   *
   * const controller = new AbortController();
   * apiRequest(
   *   "/api/endpoint",
   *   bodySchema,
   *   responseSchema,
   *   {
   *     method: "PUT", // specify HTTP method if needed (e.g., "POST", "PUT", "DELETE")
   *     body: { foo: "bar" },
   *     signal: controller.signal, // pass your signal here
   *   }
   * );
   * // To abort the request (e.g. on unmount):
   * controller.abort();
   */

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
