import { z } from "zod";
import { apiResponseSchema } from "./schema";

// Generic API response type (typed data + meta)
export type ApiResponse<TData = unknown, TMeta = unknown> = z.infer<
  typeof apiResponseSchema
> & { data: TData; meta: TMeta | null };

// Options for apiRequest (method, body, headers, auth, refresh)
export interface RequestOptions<TBody> {
  method?: string;
  body?: TBody | null;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  auth?: boolean; // send Authorization header (default true)
  refreshOn401?: boolean; // auto refresh & retry once on 401 (default true)
  retry?: boolean; // internal flag to prevent infinite loops
  // Auto success toast behavior for non-GET:
  //  - true/undefined: show toast (uses server message if present, else a sensible default)
  //  - false: suppress
  //  - string: override message
  successToast?: boolean | string;
}

// Pagination meta info for list endpoints
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  [key: string]: unknown; // allow forward‑compat extra fields
}

// Helper type for paginated list responses
export type ApiListResponse<
  TItem,
  M extends PaginationMeta = PaginationMeta
> = ApiResponse<TItem[], M>;
