import { apiRequest, unwrap } from "@/lib/api.client";
import { z } from "zod";
import {
  OrganizationMembershipArraySchema,
  OrganizationMembershipSchema,
  AddOrganizationMemberInputSchema,
  UpdateOrganizationMemberRolesInputSchema,
  type OrganizationMembershipArray,
  type OrganizationMembership,
  type AddOrganizationMemberInput,
  type UpdateOrganizationMemberRolesInput,
} from "@/organizations/member/types/organization-membership.types";

export async function listOrganizationMembers(
  orgId: number,
  params: { page?: number; pageSize?: number; q?: string; role?: string } = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  const qs = search.toString();
  const res = await apiRequest<OrganizationMembershipArray>(
    `/organizations/${orgId}/members${qs ? `?${qs}` : ""}`,
    null,
    OrganizationMembershipArraySchema
  );
  return unwrap(res);
}

export async function addOrganizationMember(
  orgId: number,
  input: AddOrganizationMemberInput
) {
  const res = await apiRequest<
    OrganizationMembership,
    AddOrganizationMemberInput
  >(
    `/organizations/${orgId}/members`,
    AddOrganizationMemberInputSchema,
    OrganizationMembershipSchema,
    { method: "POST", body: input }
  );
  return unwrap(res);
}

export async function updateOrganizationMemberRoles(
  orgId: number,
  membershipId: number,
  input: UpdateOrganizationMemberRolesInput
) {
  try {
    const res = await apiRequest<
      OrganizationMembership,
      UpdateOrganizationMemberRolesInput
    >(
      `/organizations/${orgId}/members/${membershipId}/roles`,
      UpdateOrganizationMemberRolesInputSchema,
      OrganizationMembershipSchema,
      { method: "PATCH", body: input }
    );
    return unwrap(res);
  } catch (err: any) {
    // Fallback: some backends might expose userId-based role update: /organizations/:orgId/members/:userId
    if (err && err.status === 404) {
      const alt = await apiRequest<
        OrganizationMembership,
        UpdateOrganizationMemberRolesInput
      >(
        `/organizations/${orgId}/members/${membershipId}`,
        UpdateOrganizationMemberRolesInputSchema,
        OrganizationMembershipSchema,
        { method: "PATCH", body: input }
      );
      return unwrap(alt);
    }
    throw err;
  }
}

export async function removeOrganizationMember(
  orgId: number,
  membershipId: number
) {
  const res = await apiRequest<{ success: boolean }>(
    `/organizations/${orgId}/members/${membershipId}`,
    null,
    z.object({ success: z.boolean() }),
    { method: "DELETE" }
  );
  return unwrap(res);
}
