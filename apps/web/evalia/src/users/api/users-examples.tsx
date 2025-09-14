// Example usage components for user hooks.
// These are illustrative; adapt/remove in production code.

import React from "react";
import {
  useUsers,
  useUser,
  useInfiniteUsers,
  usePrefetchUser,
  usePrefetchUsers,
} from "./users-hooks";

export function ExampleUsersList() {
  const { data, isLoading, error } = useUsers({ page: 1, pageSize: 20 });
  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users</div>;
  return (
    <div>
      <h3>Users</h3>
      <ul>
        {Array.isArray(data?.data)
          ? data.data.map((u) =>
              typeof u === "object" && u !== null && "id" in u ? (
                <li key={(u as { id: number }).id}>
                  {(u as { fullName?: string; email?: string; id: number })
                    .fullName ||
                    (u as { fullName?: string; email?: string; id: number })
                      .email ||
                    `User #${(u as { id: number }).id}`}
                </li>
              ) : null
            )
          : null}
      </ul>
    </div>
  );
}

export function ExampleUserDetail({ id }: { id: number }) {
  const { data, isLoading } = useUser(id);
  if (isLoading) return <div>Loading user...</div>;
  if (!data) return <div>Not found</div>;
  return (
    <div>
      <h4>User Detail</h4>
      <pre style={{ fontSize: 12 }}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export function ExampleInfiniteUsers() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteUsers({}, 15);
  const rawPages = (data as { pages?: unknown[] })?.pages;
  const pages = Array.isArray(rawPages)
    ? rawPages.filter(
        (p): p is { data: unknown[]; meta: unknown } =>
          typeof p === "object" &&
          p !== null &&
          "data" in p &&
          "meta" in p &&
          Array.isArray(
            typeof p === "object" && p !== null && "data" in p
              ? (p as { data?: unknown }).data
              : undefined
          )
      )
    : undefined;
  const items = pages
    ? pages.flatMap((p) =>
        Array.isArray(p.data)
          ? p.data.filter(
              (u) => typeof u === "object" && u !== null && "id" in u
            )
          : []
      )
    : [];
  return (
    <div>
      <h4>Infinite Users</h4>
      <ul>
        {items.map((u) =>
          typeof u === "object" && u !== null && "id" in u ? (
            <li key={(u as { id: number }).id}>
              {(u as { fullName?: string; email?: string; id: number })
                .fullName ||
                (u as { fullName?: string; email?: string; id: number })
                  .email ||
                `User #${(u as { id: number }).id}`}
            </li>
          ) : null
        )}
      </ul>
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}>
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
          ? "Load More"
          : "No More"}
      </button>
    </div>
  );
}

export function ExamplePrefetchOnHover({ id }: { id: number }) {
  const prefetch = usePrefetchUser();
  return (
    <button onMouseEnter={() => prefetch(id)}>
      Hover to prefetch user #{id}
    </button>
  );
}

export function UsersExamplesShowcase() {
  const prefetchList = usePrefetchUsers({ page: 1, pageSize: 20 });
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <h2>User Hooks Examples</h2>
      <button onMouseEnter={() => prefetchList()}>
        Hover to prefetch first page
      </button>
      <ExampleUsersList />
      <ExampleInfiniteUsers />
      {/* <ExampleUserDetail id={1} /> */}
    </div>
  );
}
