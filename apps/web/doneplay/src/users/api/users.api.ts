import { apiRequest } from "@/lib/api.client";
import { usersKeys } from "./users-query-keys"; // authoritative keys (moved out for consistency)
import {
  userListItemSchema,
  paginationMetaSchema,
  detailUserResponseSchema,
  listUsersQuerySchema,
  type ListUsersQuery,
  buildUsersQuery,
  type UserListItem,
  type UserDetail,
} from "../types/users.types";
import { z } from "zod";

/**
 * High-level contract:
 * - listUsers: fetch paginated users with optional filters (GET /users)
 * - getUser: fetch single user detail (GET /users/:id)
 * Both return strictly validated data using zod schemas.
 * Search semantics (q): matches fullName (case-insensitive), email (case-insensitive) and normalized phone (substring, after stripping formatting / converting 0********** to +98**********).
 */

// Internal envelope shape adapter (apiRequest already validates outer envelope; here we model inner data layout)
// Generic envelope schema for all list endpoints
const listEnvelopeSchema = z.object({
  data: z.array(userListItemSchema),
  meta: paginationMetaSchema,
});
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
): Promise<{ data: UserListItem[]; meta: unknown }> {
  const path = buildListPath(params);
  const res = await apiRequest(path, null, null); // envelope: { data, meta }
  const validated = listEnvelopeSchema.safeParse({
    data: res.data,
    meta: res.meta,
  });
  if (!validated.success) {
    throw new Error(
      "User list response validation failed: " + validated.error.message
    );
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
  // Try both res.data.data and res.data for compatibility with different API envelopes
  const userData = res.data;
  const validated = detailUserResponseSchema.safeParse(userData);
  if (!validated.success) {
    throw new Error(
      "User detail response validation failed: " + validated.error.message
    );
  }
  return validated.data;
}

/**
 * Create a new user. Server should default status/password if omitted, but we also set sensible defaults here.
 */
const createUserBodySchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  status: z.string().optional(),
});
export type CreateUserInput = z.infer<typeof createUserBodySchema>;
export async function createUser(input: CreateUserInput): Promise<UserDetail> {
  const safe: CreateUserInput = {
    status: input.status ?? "INVITED",
    password: input.password ?? "123456",
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
  };
  const res = await apiRequest<UserDetail, typeof createUserBodySchema>(
    "/users",
    createUserBodySchema,
    detailUserResponseSchema,
    { method: "POST", body: safe as any }
  );
  return res.data as unknown as UserDetail;
}

/**
 * Update a user (e.g., change status). Returns updated user detail.
 */
const updateUserBodySchema = z.object({
  status: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  globalRoles: z.array(z.string()).optional(),
});
export async function updateUser(
  id: number,
  data: Partial<{
    status: string;
    fullName: string;
    email: string;
    phone: string;
    globalRoles: string[];
  }>
): Promise<UserDetail> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("User id must be a positive integer");
  const res = await apiRequest<UserDetail, typeof updateUserBodySchema>(
    `/users/${id}`,
    updateUserBodySchema,
    detailUserResponseSchema,
    { method: "PATCH", body: data as any }
  );
  return res.data as unknown as UserDetail;
}

/**
 * Delete a user by id.
 */
export async function deleteUser(id: number): Promise<{ id: number }> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("User id must be a positive integer");
  await apiRequest(`/users/${id}`, null, null, { method: "DELETE" });
  return { id };
}

/**
 * React Query style factory helpers (optional). Consumers can wrap with @tanstack/react-query.
 * Provided as lightweight utilities so we keep this module framework‑agnostic.
 */
// NOTE: usersKeys moved to users-query-keys.ts. If you previously imported from this file, switch to:
//   import { usersKeys } from "./users-query-keys";
// We intentionally keep no re-export here to force explicit migration.

export type UsersListKey = ReturnType<typeof usersKeys.list>;
export type UserDetailKey = ReturnType<typeof usersKeys.byId>;

// Factory kept for backward compatibility in hooks; delegates to new keys.
/**
 * @deprecated Prefer using direct hooks or usersQueryFns from users-hooks/users-query-keys.
 * This factory remains for legacy integration; will be removed once all call sites migrate.
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
