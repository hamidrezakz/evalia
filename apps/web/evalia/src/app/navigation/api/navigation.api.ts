import { z } from "zod";
import { apiRequest } from "@/lib/api.client";
import {
  navigationTreeResponseSchema,
  listNavigationFlatResponseSchema,
  createNavigationItemSchema,
  updateNavigationItemSchema,
  reorderNavigationSchema,
  toggleNavigationEnabledSchema,
  buildNavigationQuery,
  type ListNavigationQuery,
  type NavigationItemFlat,
  type NavigationItemTree,
  type PlatformRole,
} from "../types/navigation.types";

/**
 * Inner envelope adapter schemas (apiRequest validates top-level standard envelope already).
 */
const innerListSchema = z.object({ data: z.array(z.any()) });
const innerTreeSchema = z.object({ data: z.array(z.any()) });
const innerSingleSchema = z.object({ data: z.any() });

/**
 * Build list (flat) path with optional filters.
 */
function buildFlatListPath(params?: Partial<ListNavigationQuery>) {
  if (!params) return "/navigation";
  return "/navigation" + buildNavigationQuery(params);
}

/**
 * Get navigation tree for a specific role (platformRole OR orgRole chosen by backend parameter). For now we pass role + tree=true.
 */
export async function getNavigationTreeForRole(
  role: PlatformRole
): Promise<NavigationItemTree[]> {
  if (!role) throw new Error("role is required");
  const qs = buildNavigationQuery({ role, tree: true });
  const res = await apiRequest("/navigation/tree" + qs, null, innerTreeSchema);
  const validated = navigationTreeResponseSchema.safeParse({
    data: res.data.data,
  });
  if (!validated.success) throw new Error("Navigation tree validation failed");
  return validated.data.data;
}

/**
 * List flat navigation items (optionally filtered by role or includeDisabled=true).
 */
export async function listNavigationFlat(
  params?: Partial<ListNavigationQuery>
): Promise<NavigationItemFlat[]> {
  const path = buildFlatListPath(params);
  const res = await apiRequest(path, null, innerListSchema);
  const validated = listNavigationFlatResponseSchema.safeParse({
    data: res.data.data,
  });
  if (!validated.success)
    throw new Error("Navigation flat list validation failed");
  return validated.data.data;
}

/**
 * Create a navigation item.
 */
export async function createNavigationItem(
  input: z.infer<typeof createNavigationItemSchema>
): Promise<NavigationItemFlat> {
  const parsed = createNavigationItemSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid create navigation payload");
  const res = await apiRequest(
    "/navigation",
    createNavigationItemSchema,
    innerSingleSchema,
    {
      method: "POST",
      body: parsed.data,
    }
  );
  // Attempt to validate as flat item (backend returns created entity)
  const validated =
    listNavigationFlatResponseSchema.shape.data.element.safeParse(
      res.data.data
    );
  if (!validated.success)
    throw new Error("Create navigation response validation failed");
  return validated.data;
}

/**
 * Update navigation item by id.
 */
export async function updateNavigationItem(
  id: number,
  input: z.infer<typeof updateNavigationItemSchema>
): Promise<NavigationItemFlat> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("id must be positive integer");
  const parsed = updateNavigationItemSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid update navigation payload");
  const res = await apiRequest(
    `/navigation/${id}`,
    updateNavigationItemSchema,
    innerSingleSchema,
    {
      method: "PUT",
      body: parsed.data,
    }
  );
  const validated =
    listNavigationFlatResponseSchema.shape.data.element.safeParse(
      res.data.data
    );
  if (!validated.success)
    throw new Error("Update navigation response validation failed");
  return validated.data;
}

/**
 * Delete a navigation item by id.
 */
export async function deleteNavigationItem(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("id must be positive integer");
  await apiRequest(`/navigation/${id}`, null, innerSingleSchema, {
    method: "DELETE",
  });
  return true;
}

/**
 * Reorder a set of navigation items.
 */
export async function reorderNavigation(
  payload: z.infer<typeof reorderNavigationSchema>
): Promise<boolean> {
  const parsed = reorderNavigationSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Invalid reorder navigation payload");
  await apiRequest(
    "/navigation/reorder",
    reorderNavigationSchema,
    innerSingleSchema,
    {
      method: "POST",
      body: parsed.data,
    }
  );
  return true;
}

/**
 * Toggle enabled/disabled state.
 */
export async function toggleNavigationEnabled(
  id: number,
  payload: z.infer<typeof toggleNavigationEnabledSchema>
): Promise<NavigationItemFlat> {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("id must be positive integer");
  const parsed = toggleNavigationEnabledSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Invalid toggle navigation payload");
  const res = await apiRequest(
    `/navigation/${id}/toggle`,
    toggleNavigationEnabledSchema,
    innerSingleSchema,
    { method: "PATCH", body: parsed.data }
  );
  const validated =
    listNavigationFlatResponseSchema.shape.data.element.safeParse(
      res.data.data
    );
  if (!validated.success)
    throw new Error("Toggle navigation response validation failed");
  return validated.data;
}

/**
 * React Query key helpers.
 */
export const navigationKeys = {
  all: ["navigation"] as const,
  flat: (p?: Partial<ListNavigationQuery>) =>
    [
      "navigation",
      "flat",
      Object.keys(p || {})
        .sort()
        .map((k) => `${k}:${(p as any)[k]}`),
    ] as const,
  tree: (role: PlatformRole) => ["navigation", "tree", role] as const,
  item: (id: number) => ["navigation", "item", id] as const,
};

export type NavigationFlatKey = ReturnType<typeof navigationKeys.flat>;
export type NavigationTreeKey = ReturnType<typeof navigationKeys.tree>;

/**
 * Factory producing functions ready for react-query usage.
 */
export function createNavigationQueryFns() {
  return {
    flat: (p?: Partial<ListNavigationQuery>) => () => listNavigationFlat(p),
    tree: (role: PlatformRole) => () => getNavigationTreeForRole(role),
  } as const;
}

/**
 * Optional OO style facade.
 */
export class NavigationApiClient {
  listFlat(params?: Partial<ListNavigationQuery>) {
    return listNavigationFlat(params);
  }
  tree(role: PlatformRole) {
    return getNavigationTreeForRole(role);
  }
  create(input: z.infer<typeof createNavigationItemSchema>) {
    return createNavigationItem(input);
  }
  update(id: number, input: z.infer<typeof updateNavigationItemSchema>) {
    return updateNavigationItem(id, input);
  }
  delete(id: number) {
    return deleteNavigationItem(id);
  }
  reorder(payload: z.infer<typeof reorderNavigationSchema>) {
    return reorderNavigation(payload);
  }
  toggle(id: number, payload: z.infer<typeof toggleNavigationEnabledSchema>) {
    return toggleNavigationEnabled(id, payload);
  }
}
