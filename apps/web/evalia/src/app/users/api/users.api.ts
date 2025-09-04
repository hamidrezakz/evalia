import { z } from "zod";
import { apiRequest, unwrap } from "@/lib/api.client";
import {
  listUsersResponseSchema,
  detailUserResponseSchema,
  listUsersQuerySchema,
  type ListUsersQuery,
  buildUsersQuery,
  type UserListItem,
  type UserDetail,
} from "../types/users.types";

/**
 * High-level contract:
 * - listUsers: fetch paginated users with optional filters (GET /users)
 * - getUser: fetch single user detail (GET /users/:id)
 * Both return strictly validated data using zod schemas.
 */

// Internal envelope shape adapter (apiRequest already validates outer envelope; here we model inner data layout)
const listInnerSchema = z.object({ data: z.array(z.any()), meta: z.any() });
const detailInnerSchema = z.any();

/**
 * Normalizes and validates query params, builds the final request path.
 */
function buildListPath(raw?: Partial<ListUsersQuery>): string {
  if (!raw) return "/users";
  // First coerce via schema (tolerant of string inputs from search params)
  const parsed = listUsersQuerySchema.safeParse(raw);
  if (!parsed.success) {
    // We throw a concise error; caller can catch and show UI message
    throw new Error("Invalid user list query parameters");
  }
  const qs = buildUsersQuery(parsed.data);
  return "/users" + qs;
}

/**
 * Fetch a paginated list of users.
 * Accepts optional raw (possibly unvalidated) params.
 * Returns: { data: UserListItem[]; meta: PaginationMeta }
 */
export async function listUsers(
  params?: Partial<ListUsersQuery>
): Promise<{ data: UserListItem[]; meta: any }> {
  const path = buildListPath(params);
  const res = await apiRequest(path, null, listInnerSchema);
  // Validate inner structure strictly using final schemas
  const validated = listUsersResponseSchema.safeParse({
    data: res.data.data,
    meta: res.data.meta,
  });
  if (!validated.success) {
    throw new Error("User list response validation failed");
  }
  return validated.data;
}

/**
 * Fetch detail for a single user by numeric id.
 */
export async function getUser(id: number): Promise<UserDetail> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("User id must be a positive integer");
  const res = await apiRequest(`/users/${id}`, null, detailInnerSchema);
  const validated = detailUserResponseSchema.safeParse(res.data.data);
  if (!validated.success) {
    throw new Error("User detail response validation failed");
  }
  return validated.data;
}

/**
 * React Query style factory helpers (optional). Consumers can wrap with @tanstack/react-query.
 * Provided as lightweight utilities so we keep this module framework‑agnostic.
 */
export const usersKeys = {
  all: ["users"] as const,
  list: (p?: Partial<ListUsersQuery>) =>
    [
      "users",
      "list",
      Object.keys(p || {})
        .sort()
        .map((k) => `${k}:${(p as any)[k]}`),
    ] as const,
  detail: (id: number) => ["users", "detail", id] as const,
};

export type UsersListKey = ReturnType<typeof usersKeys.list>;
export type UserDetailKey = ReturnType<typeof usersKeys.detail>;

/**
 * Optional convenience wrappers tailored for react-query usage.
 * Example:
 *   const query = useQuery(usersKeys.list(filters), () => listUsers(filters));
 */
export function createUsersQueryFns() {
  return {
    list: (params?: Partial<ListUsersQuery>) => () => listUsers(params),
    detail: (id: number) => () => getUser(id),
  } as const;
}

/**
 * Lightweight client facade (OOP style) if some consumers prefer a class interface.
 */
export class UsersApiClient {
  list(params?: Partial<ListUsersQuery>) {
    return listUsers(params);
  }
  detail(id: number) {
    return getUser(id);
  }
}
