/**
 * React Query hooks for the User domain.
 *
 * Design principles:
 * - Mirror organization hooks for mental model consistency.
 * - Typed responses with Zod validation handled in api layer (users.api.ts).
 * - Hierarchical keys (usersKeys) enable selective invalidation.
 * - Infinite + paginated variants supported.
 * - Prefetch helpers for UX smoothing (hover / intersection observers).
 * - Mutation pattern (optimistic) demonstrated via useUpdateUser.
 */
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { listUsers, getUser, createUsersQueryFns } from "./users.api";
import { usersKeys } from "./users-query-keys";
import type {
  ListUsersQuery,
  UserDetail,
  UserListItem,
} from "../types/users.types";

// Cache policy constants
const STALE_LIST = 60 * 1000; // 1m
const STALE_DETAIL = 2 * 60 * 1000; // 2m

/**
 * Standard paginated list (not infinite) - returns { data, meta } from API.
 * Keep the params object shape stable for caching (caller should memoize if building dynamically).
 */
/**
 * Standard paginated list.
 * Returns { data, meta } object (from listUsers) where data is UserListItem[].
 */
export function useUsers(params?: Partial<ListUsersQuery>) {
  // تبدیل و مقداردهی پیش‌فرض عددی برای page و pageSize
  const safeParams = { ...params };
  safeParams.page =
    typeof safeParams.page === "string"
      ? parseInt(safeParams.page, 10)
      : Number(safeParams.page ?? 1);
  safeParams.pageSize =
    typeof safeParams.pageSize === "string"
      ? parseInt(safeParams.pageSize, 10)
      : Number(safeParams.pageSize ?? 20);
  if (isNaN(safeParams.page) || safeParams.page < 1) safeParams.page = 1;
  if (isNaN(safeParams.pageSize) || safeParams.pageSize < 1)
    safeParams.pageSize = 20;
  if (safeParams.id !== undefined) safeParams.id = Number(safeParams.id);
  // orgId باید فقط وقتی ارسال شود که یک عدد صحیح مثبت باشد
  if (safeParams.orgId == null) {
    delete (safeParams as any).orgId;
  } else {
    const n =
      typeof safeParams.orgId === "string"
        ? parseInt(safeParams.orgId as unknown as string, 10)
        : Number(safeParams.orgId);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
      delete (safeParams as any).orgId;
    } else {
      (safeParams as any).orgId = n;
    }
  }
  return useQuery({
    queryKey: usersKeys.list(safeParams),
    queryFn: async () => listUsers(safeParams),
    staleTime: STALE_LIST,
    // structural sharing automatically keeps old data during param changes if shape similar
  });
}

/** Fetch a single user detail by id */
/**
 * Fetch a single user; disabled when id is falsy.
 */
export function useUser(id: number | null) {
  return useQuery({
    queryKey: id ? usersKeys.byId(id) : ["users", "detail", "disabled"],
    queryFn: async () => {
      if (!id) throw new Error("No user id");
      return getUser(id) as Promise<UserDetail>;
    },
    enabled: !!id,
    staleTime: STALE_DETAIL,
  });
}

/**
 * Infinite user list with page/next logic derived from meta.hasNext + meta.page.
 * Accepts base filters except page/pageSize which are managed internally.
 */
/**
 * Infinite scroll variant.
 * getNextPageParam uses backend meta.hasNext + meta.page.
 */
export function useInfiniteUsers(
  baseParams: Omit<Partial<ListUsersQuery>, "page" | "pageSize"> = {},
  pageSize = 20
) {
  return useInfiniteQuery<
    { data: UserListItem[]; meta: unknown },
    Error,
    { data: UserListItem[]; meta: unknown }
  >({
    queryKey: ["users", "infinite", baseParams, pageSize],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const pageNum = typeof pageParam === "number" ? pageParam : 1;
      return listUsers({ ...baseParams, page: pageNum, pageSize });
    },
    getNextPageParam: (lastPage) => {
      if (
        typeof lastPage.meta === "object" &&
        lastPage.meta !== null &&
        "hasNext" in lastPage.meta &&
        "page" in lastPage.meta
      ) {
        const meta = lastPage.meta as { hasNext?: boolean; page?: number };
        if (meta.hasNext) return (meta.page || 1) + 1;
      }
      return undefined;
    },
    staleTime: STALE_LIST,
  });
}

/** Prefetch helpers (e.g., call on hover) */
/** Prefetch a user detail (call in onMouseEnter/onFocus). */
export function usePrefetchUser() {
  const qc = useQueryClient();
  return (id: number) =>
    qc.prefetchQuery({
      queryKey: usersKeys.byId(id),
      queryFn: () => getUser(id),
    });
}
/** Prefetch a users list (first page). */
export function usePrefetchUsers(params?: Partial<ListUsersQuery>) {
  const qc = useQueryClient();
  return () =>
    qc.prefetchQuery({
      queryKey: usersKeys.list(params),
      queryFn: () => listUsers(params),
    });
}

// Example mutation placeholders (User creation/update flows can be added later)
// They demonstrate how we would structure invalidations.

interface UpdateUserInput {
  id: number;
  data: Partial<{ fullName: string; status: string }>;
}

/**
 * Generic update user mutation with optimistic cache merge.
 * Provide a domain-specific mutationFn that performs the real API call.
 */
export function useUpdateUser(
  mutationFn: (input: UpdateUserInput) => Promise<UserDetail>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: usersKeys.byId(vars.id) });
      const prev = qc.getQueryData<UserDetail>(usersKeys.byId(vars.id));
      if (prev) {
        qc.setQueryData(usersKeys.byId(vars.id), { ...prev, ...vars.data });
      }
      return { prev };
    },
    onError: (_e, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(usersKeys.byId(vars.id), ctx.prev);
    },
    onSuccess: (updated, vars) => {
      qc.setQueryData(usersKeys.byId(vars.id), updated);
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

/** Convenience factory returning stable query functions (parallels createUsersQueryFns) */
export const usersQueryFns = createUsersQueryFns();
