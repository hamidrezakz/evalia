// Small wrapper layer around scattered API functions so AuthContext has a single import surface.
// This also simplifies future changes (e.g., batching, added headers, error normalization).

import { getUser } from "@/app/users/api/users.api";
import { listUserOrganizations } from "@/app/organizations/organization/api/organization.api";

export async function fetchUser(userId: number) {
  return getUser(userId);
}

export async function fetchOrganizations() {
  const res = await listUserOrganizations();
  // If backend returns envelope, extract data
  return res ?? [];
}
