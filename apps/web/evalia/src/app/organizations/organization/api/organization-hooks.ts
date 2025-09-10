/**
 * High-level React Query hooks for the Organization domain.
 *
 * Design goals:
 * - Consistent hierarchical query keys (see orgKeys) for broad + granular invalidation.
 * - Encapsulate API layer so UI imports only from this file ("ready to fire").
 * - Provide optimistic UX for create/update/delete with safe rollback.
 * - Keep conservative staleTimes; caller can override per-instance if needed.
 * - Return typed data (Organization / OrganizationArray) with membership info included where relevant.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  restoreOrganization,
  changeOrganizationStatus,
  ensureOrgSlugAvailable,
  listUserOrganizations,
} from "./organization.api";
import { orgKeys } from "./organization-query-keys";
import type {
  Organization,
  OrganizationArray,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  ChangeOrganizationStatusInput,
} from "../types/organization.types";
import type { Organization as Org } from "../types/organization.types";

// Centralized default cache policies
const STALE_TIME_LIST = 60 * 1000; // 1 min
const STALE_TIME_DETAIL = 2 * 60 * 1000; // 2 min
const STALE_TIME_USER_ORGS = 2 * 60 * 1000; // 2 min

// -------- Queries --------
/**
 * Paginated/filtered organization listing.
 * Provide the same params object identity to benefit from caching.
 */
export function useOrganizations(params?: Partial<Record<string, any>>) {
  return useQuery({
    queryKey: orgKeys.list(params),
    queryFn: async () => {
      const res = await listOrganizations(params || ({} as any));
      return res.data as OrganizationArray;
    },
    staleTime: STALE_TIME_LIST,
    // If using React Query v4 and want transition smoothing, re-add keepPreviousData: true
  });
}

/** Fetch a single organization by id (disabled when id is null). */
export function useOrganization(id: number | null) {
  return useQuery({
    queryKey: id ? orgKeys.byId(id) : ["org", "disabled"],
    queryFn: async () => {
      if (!id) throw new Error("No organization id");
      const res = await getOrganization(id);
      return res.data as Organization;
    },
    enabled: !!id,
    staleTime: STALE_TIME_DETAIL,
  });
}

/**
 * Organizations the current authenticated user is a member of.
 * Non‑paginated for quick auth context usage, includes membership { role, membershipId }.
 */
export function useUserOrganizations(enabled: boolean = true) {
  return useQuery({
    queryKey: orgKeys.userMembership(),
    queryFn: async () => {
      const res = await listUserOrganizations();
      return res.data as OrganizationArray; // includes membership field
    },
    enabled,
    staleTime: STALE_TIME_USER_ORGS,
  });
}

/**
 * Checks if a slug is available (client-side heuristic via list filter until a dedicated endpoint exists).
 */
export function useEnsureOrgSlug(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...orgKeys.all, "slug-available", slug],
    queryFn: () => ensureOrgSlugAvailable(slug),
    enabled: !!slug && enabled,
    staleTime: 30 * 1000,
  });
}

// -------- Mutations (with cache invalidation + optimistic updates) --------
/** Create organization with optimistic append to cached lists. */
export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: orgKeys.lists() });
      const prev = qc.getQueriesData<OrganizationArray>({
        queryKey: orgKeys.lists(),
      });
      // Optimistically insert into each cached list (simple approach, assumes filter passes)
      prev.forEach(([key, data]) => {
        if (data) {
          qc.setQueryData(key, [
            ...data,
            {
              id: -Date.now(),
              name: input.name,
              slug: input.slug || "",
              plan: input.plan || "FREE",
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
            } as any,
          ]);
        }
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, data]: any) => qc.setQueryData(key, data));
    },
    onSuccess: (res) => {
      // Replace optimistic entries by invalidating
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
      qc.setQueryData(orgKeys.byId(res.data.id), res.data);
    },
  });
}

/** Patch organization, optimistic merge into detail cache. */
export function useUpdateOrganization(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) =>
      updateOrganization(id, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: orgKeys.byId(id) });
      const prevDetail = qc.getQueryData<Organization>(orgKeys.byId(id));
      if (prevDetail) {
        qc.setQueryData(orgKeys.byId(id), { ...prevDetail, ...input });
      }
      return { prevDetail };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevDetail) qc.setQueryData(orgKeys.byId(id), ctx.prevDetail);
    },
    onSuccess: (res) => {
      qc.setQueryData(orgKeys.byId(id), res.data);
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
    },
  });
}

/** Change organization status; invalidates list + membership. */
export function useChangeOrganizationStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ChangeOrganizationStatusInput) =>
      changeOrganizationStatus(id, input),
    onSuccess: (res) => {
      qc.setQueryData(orgKeys.byId(id), res.data);
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
    },
  });
}

/** Soft delete organization with optimistic removal from list caches. */
export function useDeleteOrganization(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteOrganization(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: orgKeys.lists() });
      const prevLists = qc.getQueriesData<OrganizationArray>({
        queryKey: orgKeys.lists(),
      });
      prevLists.forEach(([key, data]) => {
        if (data)
          qc.setQueryData(
            key,
            data.filter((o: any) => o.id !== id)
          );
      });
      return { prevLists };
    },
    onError: (_e, _v, ctx) => {
      ctx?.prevLists.forEach(([key, data]: any) => qc.setQueryData(key, data));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
      qc.removeQueries({ queryKey: orgKeys.byId(id) });
    },
  });
}

/** Restore a soft-deleted organization; refresh lists + membership. */
export function useRestoreOrganization(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => restoreOrganization(id),
    onSuccess: (res) => {
      qc.setQueryData(orgKeys.byId(id), res.data);
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
    },
  });
}

// ----- Action variants (id provided at mutate-time) -----
/** Change status by passing { id, status } to mutate. Suitable for tables. */
export function useChangeOrganizationStatusAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; status: Org["status"] }) =>
      changeOrganizationStatus(vars.id, { status: vars.status }),
    onSuccess: (res, vars) => {
      qc.setQueryData(orgKeys.byId(vars.id), res.data);
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
    },
  });
}

/** Delete by id passed to mutate(id). */
export function useDeleteOrganizationAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOrganization(id),
    onSuccess: (_res, id) => {
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.removeQueries({ queryKey: orgKeys.byId(id) });
    },
  });
}

/** Restore by id passed to mutate(id). */
export function useRestoreOrganizationAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreOrganization(id),
    onSuccess: (res, id) => {
      qc.setQueryData(orgKeys.byId(id), res.data);
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: orgKeys.userMembership() });
    },
  });
}
