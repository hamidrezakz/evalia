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
 * Tree item for navigation (only used for tree endpoint).
 */
export type NavigationItemTree = {
  id: number;
  label: string;
  path?: string | null;
  externalUrl?: string | null;
  iconName?: string | null;
  order: number;
  isActive?: boolean;
  meta?: Record<string, any>;
  parentId?: number | null;
  children?: NavigationItemTree[];
};

export const navigationItemTreeSchema: z.ZodType<NavigationItemTree> = z.object(
  {
    id: z.number().int().positive(),
    label: z.string().min(1),
    path: z.string().nullable().optional(),
    externalUrl: z.string().nullable().optional(),
    iconName: z.string().nullable().optional(),
    order: z.number().int(),
    isActive: z.boolean().optional(),
    meta: z.object({}).passthrough().optional(),
    parentId: z.number().int().nullable().optional(),
    children: z.array(z.lazy(() => navigationItemTreeSchema)).default([]),
  }
);

/**
 * Tree response schema.
 */
export const navigationTreeResponseSchema = z.array(navigationItemTreeSchema);

/**
 * Helper to build query for tree endpoint (single role, options).
 */
export const listNavigationQuerySchema = z.object({
  platformRole: platformRoleEnum.optional(),
  orgRole: orgRoleEnum.optional(),
  includeInactive: z.coerce.boolean().optional(),
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
