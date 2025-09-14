/**
 * Cache utilities for user domain (invalidate, prefetch, selectors, optimistic helpers).
 * This isolates cache-manipulation logic from hooks & API layer.
 */
import { QueryClient } from "@tanstack/react-query";
import { usersKeys } from "./users-query-keys";
import { listUsers, getUser } from "./users.api";
import type {
  ListUsersQuery,
  UserDetail,
  UserListItem,
} from "../types/users.types";

/** Invalidate all user data */
/** Invalidate every users-related query (broad hammer). */
export function invalidateAllUsers(qc: QueryClient) {
  return qc.invalidateQueries({ queryKey: usersKeys.all });
}

/** Invalidate list collections (any params) */
/** Invalidate only list queries (any param variation). */
export function invalidateUserLists(qc: QueryClient) {
  return qc.invalidateQueries({ queryKey: usersKeys.lists() });
}

/** Invalidate single user detail */
/** Invalidate a specific user detail record. */
export function invalidateUserDetail(qc: QueryClient, id: number) {
  return qc.invalidateQueries({ queryKey: usersKeys.byId(id) });
}

/** Prefetch a particular user */
/** Prefetch a user detail into cache (idempotent). */
export function prefetchUser(qc: QueryClient, id: number) {
  return qc.prefetchQuery({
    queryKey: usersKeys.byId(id),
    queryFn: () => getUser(id),
  });
}

/** Prefetch a list with given params */
/** Prefetch a user list variant. Use for hover/intention or SSR warmup. */
export function prefetchUserList(
  qc: QueryClient,
  params?: Partial<ListUsersQuery>
) {
  return qc.prefetchQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => listUsers(params),
  });
}

/** Optimistically patch a user detail (merges partial fields) */
/**
 * Optimistically merge partial fields into user detail; returns rollback function.
 * Only safe for non-structural fields (strings, status etc.).
 */
export function optimisticMergeUser(
  qc: QueryClient,
  id: number,
  patch: Partial<UserDetail>
) {
  const key = usersKeys.byId(id);
  const prev = qc.getQueryData<UserDetail>(key);
  if (prev) {
    qc.setQueryData<UserDetail>(key, { ...prev, ...patch });
  }
  return () => {
    if (prev) qc.setQueryData<UserDetail>(key, prev);
  };
}

/** Update list items that contain the user (e.g., name change) */
/** Push specific user fields (e.g., name/status) to all cached list pages. */
export function propagateUserToLists(qc: QueryClient, updated: UserDetail) {
  // Iterate over matching list queries
  const queries = qc
    .getQueryCache()
    .findAll({ queryKey: usersKeys.lists(), exact: false });
  queries.forEach((q) => {
    const data = q.state.data as unknown;
    if (
      typeof data === "object" &&
      data !== null &&
      "data" in data &&
      Array.isArray((data as { data: UserListItem[] }).data)
    ) {
      let changed = false;
      const nextItems: UserListItem[] = (
        data as { data: UserListItem[] }
      ).data.map((item) => {
        if (item.id === updated.id) {
          changed = true;
          return {
            ...item,
            fullName: updated.fullName,
            status: updated.status,
          };
        }
        return item;
      });
      if (changed) {
        q.setData({ ...data, data: nextItems });
      }
    }
  });
}

/** Remove a user from all list caches (e.g., after delete) */
/** Remove a user id from every cached list (after deletion). */
export function removeUserFromLists(qc: QueryClient, userId: number) {
  const queries = qc
    .getQueryCache()
    .findAll({ queryKey: usersKeys.lists(), exact: false });
  queries.forEach((q) => {
    const data = q.state.data as unknown;
    if (
      typeof data === "object" &&
      data !== null &&
      "data" in data &&
      Array.isArray((data as { data: UserListItem[] }).data)
    ) {
      const filtered = (data as { data: UserListItem[] }).data.filter(
        (u) => u.id !== userId
      );
      if (filtered.length !== (data as { data: UserListItem[] }).data.length) {
        q.setData({ ...data, data: filtered });
      }
    }
  });
}
