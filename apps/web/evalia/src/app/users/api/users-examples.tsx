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
        {data?.data.map((u) => (
          <li key={u.id}>{u.fullName || u.email || `User #${u.id}`}</li>
        ))}
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
  const pages = (data as any)?.pages as
    | Array<{ data: any[]; meta: any }>
    | undefined;
  const items = pages ? pages.flatMap((p) => p.data) : [];
  return (
    <div>
      <h4>Infinite Users</h4>
      <ul>
        {items.map((u: any) => (
          <li key={u.id}>{u.fullName || u.email || `User #${u.id}`}</li>
        ))}
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
