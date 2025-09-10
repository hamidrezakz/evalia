import { z } from "zod";
import { apiRequest } from "./request";

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
