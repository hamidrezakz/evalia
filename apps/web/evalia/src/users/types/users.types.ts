import { z } from "zod";
// UserStatus type is imported below via type-only import

/**
 * Canonical user status enum (mirror backend). Adjust if backend enum changes.
 */
import { UserStatusEnum } from "@/lib/enums";
export const userStatusEnum = z.enum([...UserStatusEnum.values]);
export type UserStatus = import("@/lib/enums").UserStatus;

/**
 * Organization membership (flattened) for a user.
 */
export const userOrganizationSchema = z.object({
  orgId: z.number().int().positive(),
  roles: z.array(z.string()).min(1),
});
export type UserOrganization = z.infer<typeof userOrganizationSchema>;

/**
 * Team reference attached to a user.
 */
export const userTeamSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  organizationId: z.number().int().positive(),
});
export type UserTeam = z.infer<typeof userTeamSchema>;

/**
 * Shape of a single user item used in list responses.
 */
export const userListItemSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(), // relax: allow null or string
  phone: z.string().nullable().optional(), // relax: allow null or string
  avatarUrl: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  status: userStatusEnum,
  globalRoles: z.array(z.string()).default([]),
  organizations: z.preprocess(
    (v) => (v == null ? [] : v),
    z.array(userOrganizationSchema)
  ),
  teams: z.preprocess((v) => (v == null ? [] : v), z.array(userTeamSchema)),
  createdAt: z.string(), // ISO date
});
export type UserListItem = z.infer<typeof userListItemSchema>;

/**
 * Detail view adds membershipId & joinedAt for organizations; for now we re-use list item for base.
 */
export const userDetailSchema = userListItemSchema.extend({
  organizations: z.array(
    userOrganizationSchema.extend({
      membershipId: z.number().int().positive().optional(),
      joinedAt: z.string().optional(),
    })
  ),
  teams: z.preprocess((v) => (v == null ? [] : v), z.array(userTeamSchema)),
});
export type UserDetail = z.infer<typeof userDetailSchema>;

/**
 * Pagination meta schema (mirrors backend standard envelope meta for lists).
 */
export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  pageCount: z.number().int().nonnegative(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * List users response schema (inner data only, envelope is validated separately in api.client).
 */
export const listUsersResponseSchema = z.object({
  data: z.array(userListItemSchema),
  meta: paginationMetaSchema,
});

/**
 * Detail user response schema (inner data only).
 */
export const detailUserResponseSchema = userDetailSchema;

/**
 * Client-side query params schema (mirrors backend ListUsersDto). All fields optional.
 * We keep them loose (string | number) because Next.js route search params are strings initially.
 */
export const listUsersQuerySchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  status: userStatusEnum.optional(),
  statuses: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      if (Array.isArray(v)) return v;
      return v.split(",");
    }),
  q: z.string().optional(),
  orgId: z.union([z.string(), z.number()]).optional(),
  teamName: z.string().optional(),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  pageSize: z.coerce.number().int().positive().max(200).default(20).optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

/**
 * Utility to build a safe query string from validated params.
 */
export function buildUsersQuery(params: Partial<ListUsersQuery>): string {
  const entries: [string, string][] = [];
  for (let [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    // Normalize aliases: map organizationId->orgId and search->q; do NOT duplicate keys
    if (k === "organizationId") k = "orgId";
    if (k === "search") k = "q";
    // Force orgId to be an integer
    if (k === "orgId") {
      const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) continue;
      v = n;
    }
    if (Array.isArray(v)) {
      if (!v.length) continue;
      if (k === "statuses") entries.push([k, v.join(",")]);
      else v.forEach((val) => entries.push([k, String(val)]));
    } else {
      entries.push([k, String(v)]);
    }
  }
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `?${qs}` : "";
}
