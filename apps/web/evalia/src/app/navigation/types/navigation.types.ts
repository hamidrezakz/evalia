import { z } from "zod";

/**
 * Shared enums (mirror backend). Adjust if backend enums evolve.
 */
export const platformRoleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "USER",
]);
export type PlatformRole = z.infer<typeof platformRoleEnum>;

export const orgRoleEnum = z.enum([
  "OWNER",
  "ORG_ADMIN",
  "ORG_MANAGER",
  "ORG_USER",
]);
export type OrgRole = z.infer<typeof orgRoleEnum>;

/**
 * Navigation display type & link target
 */
export const navTargetEnum = z.enum(["INTERNAL", "EXTERNAL"]);
export type NavTarget = z.infer<typeof navTargetEnum>;

/**
 * Flat navigation item (as returned in list endpoints).
 */
export const navigationItemFlatSchema = z.object({
  id: z.number().int().positive(),
  parentId: z.number().int().positive().nullable(),
  label: z.string().min(1),
  icon: z.string().nullable().optional(),
  path: z.string().nullable().optional(),
  externalUrl: z.string().url().nullable().optional(),
  order: z.number().int(),
  enabled: z.boolean(),
  description: z.string().nullable().optional(),
  platformRoles: z.array(platformRoleEnum).default([]),
  orgRoles: z.array(orgRoleEnum).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type NavigationItemFlat = z.infer<typeof navigationItemFlatSchema>;

/**
 * Tree item extends flat with nested children.
 */
export const navigationItemTreeSchema: z.ZodType<any> =
  navigationItemFlatSchema.extend({
    children: z.lazy(() => z.array(navigationItemTreeSchema)).default([]),
  });
export type NavigationItemTree = z.infer<typeof navigationItemTreeSchema>;

/**
 * List (flat) response schema.
 */
export const listNavigationFlatResponseSchema = z.object({
  data: z.array(navigationItemFlatSchema),
});

/**
 * Tree response schema.
 */
export const navigationTreeResponseSchema = z.object({
  data: z.array(navigationItemTreeSchema),
});

/**
 * Create navigation item payload (frontend form -> backend DTO). path XOR externalUrl.
 */
export const createNavigationItemSchema = z
  .object({
    parentId: z.number().int().positive().nullable().optional(),
    label: z.string().min(1),
    icon: z.string().nullable().optional(),
    path: z.string().trim().optional().nullable(),
    externalUrl: z.string().url().optional().nullable(),
    description: z.string().optional().nullable(),
    platformRoles: z.array(platformRoleEnum).optional(),
    orgRoles: z.array(orgRoleEnum).optional(),
    enabled: z.boolean().default(true).optional(),
    order: z.number().int().optional(),
  })
  .refine(
    (d) => {
      const hasPath = !!d.path && d.path.trim().length > 0;
      const hasUrl = !!d.externalUrl && d.externalUrl.trim().length > 0;
      return (hasPath || hasUrl) && !(hasPath && hasUrl);
    },
    { message: "Provide exactly one of path or externalUrl" }
  );
export type CreateNavigationItemInput = z.infer<
  typeof createNavigationItemSchema
>;

/**
 * Update navigation item payload (partial except ID path param). path/externalUrl logic retained.
 */
export const updateNavigationItemSchema = createNavigationItemSchema.partial();
export type UpdateNavigationItemInput = z.infer<
  typeof updateNavigationItemSchema
>;

/**
 * Reorder item payload: supply ordered array of {id, order} or for a single parent subtree.
 */
export const reorderNavigationSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        order: z.number().int().nonnegative(),
      })
    )
    .min(1),
});
export type ReorderNavigationInput = z.infer<typeof reorderNavigationSchema>;

/**
 * Toggle enabled status payload.
 */
export const toggleNavigationEnabledSchema = z.object({
  enabled: z.boolean(),
});
export type ToggleNavigationEnabledInput = z.infer<
  typeof toggleNavigationEnabledSchema
>;

/**
 * Helper to build query for listing flat items (optional filters).
 */
export const listNavigationQuerySchema = z.object({
  role: platformRoleEnum.optional(),
  includeDisabled: z.coerce.boolean().optional(),
  tree: z.coerce.boolean().optional(),
});
export type ListNavigationQuery = z.infer<typeof listNavigationQuerySchema>;

export function buildNavigationQuery(params: Partial<ListNavigationQuery>) {
  const entries: [string, string][] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && (v as unknown as string).length === 0)
      continue;
    entries.push([k, String(v)]);
  }
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `?${qs}` : "";
}
