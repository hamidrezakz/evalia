// Practical usage examples of the organization React Query hooks.
// colocated with the API & hooks so developers can discover patterns quickly.
// (These are illustrative components; remove or adapt in production.)

import React from "react";
import {
  useOrganizations,
  useOrganization,
  useUserOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useChangeOrganizationStatus,
  useRestoreOrganization,
  useEnsureOrgSlug,
} from "./organization-hooks";

// 1. Listing organizations with basic pagination
export function ExampleOrganizationList() {
  const { data, isLoading, error } = useOrganizations({
    page: 1,
    pageSize: 10,
  });
  if (isLoading) return <div>Loading organizations...</div>;
  if (error) return <div>Error loading organizations</div>;
  return (
    <ul>
      {data?.map((o) => (
        <li key={o.id}>
          {o.name} <small>({o.slug})</small>
        </li>
      ))}
    </ul>
  );
}

// 2. Detail view with conditional fetch
export function ExampleOrganizationDetail({ id }: { id: number }) {
  const { data, isLoading } = useOrganization(id);
  if (isLoading) return <div>Loading detail...</div>;
  if (!data) return <div>Not found</div>;
  return (
    <div>
      <h3>{data.name}</h3>
      <p>Slug: {data.slug}</p>
      <p>Status: {data.status}</p>
      {data.membership && <p>Your role: {data.membership.role}</p>}
    </div>
  );
}

// 3. Current user membership list (for switcher / header)
export function ExampleUserOrganizationsSwitcher() {
  const { data, isLoading } = useUserOrganizations();
  if (isLoading) return <span>Loading...</span>;
  if (!data?.length) return <span>No organizations</span>;
  return (
    <select>
      {data.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name} {o.membership?.role ? `(${o.membership.role})` : ""}
        </option>
      ))}
    </select>
  );
}

// 4. Create + slug availability check
export function ExampleCreateOrganization() {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const createOrg = useCreateOrganization();
  const { data: slugAvailable } = useEnsureOrgSlug(slug, slug.length > 2);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrg.mutate({ name, slug, plan: "FREE" });
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      {slug && (
        <span style={{ fontSize: 12 }}>
          {slugAvailable === false && "(Taken)"}
          {slugAvailable === true && "(Available)"}
        </span>
      )}
      <button type="submit" disabled={createOrg.isPending}>
        {createOrg.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

// 5. Update + status change + delete/restore flows (composed)
export function ExampleOrganizationAdminActions({ id }: { id: number }) {
  const update = useUpdateOrganization(id);
  const changeStatus = useChangeOrganizationStatus(id);
  const del = useDeleteOrganization(id);
  const restore = useRestoreOrganization(id);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => update.mutate({ name: "Renamed" })}>Rename</button>
      <button
        onClick={() => changeStatus.mutate({ status: "SUSPENDED" as any })}>
        Suspend
      </button>
      <button onClick={() => del.mutate()} disabled={del.isPending}>
        Delete
      </button>
      <button onClick={() => restore.mutate()} disabled={restore.isPending}>
        Restore
      </button>
    </div>
  );
}

// 6. Combined showcase
export function OrganizationExamplesShowcase() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <h2>Organization Hooks Examples</h2>
      <ExampleCreateOrganization />
      <ExampleOrganizationList />
      <ExampleUserOrganizationsSwitcher />
      {/* ExampleOrganizationDetail would need a valid id */}
    </div>
  );
}
