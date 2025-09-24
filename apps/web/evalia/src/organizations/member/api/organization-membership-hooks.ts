import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgKeys } from "@/organizations/organization/api/organization-query-keys";
import type {
  Organization,
  OrganizationArray,
} from "@/organizations/organization/types/organization.types";
import { usersKeys } from "@/users/api/users-query-keys";
import {
  listOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMemberRoles,
  removeOrganizationMember,
} from "./organization-membership.api";
import { organizationMembershipKeys } from "./organization-membership-query-keys";
import type {
  OrganizationMembershipArray,
  OrganizationMembership,
  AddOrganizationMemberInput,
  UpdateOrganizationMemberRolesInput,
} from "../types/organization-membership.types";

const STALE = 60 * 1000;

export function useOrganizationMembers(
  orgId: number,
  params?: { page?: number; pageSize?: number },
  enabled: boolean = true
) {
  return useQuery<OrganizationMembershipArray>({
    queryKey: organizationMembershipKeys.list(orgId, params),
    queryFn: () => listOrganizationMembers(orgId, params),
    staleTime: STALE,
    enabled,
  });
}

export function useAddOrganizationMember(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddOrganizationMemberInput) =>
      addOrganizationMember(orgId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({
        queryKey: organizationMembershipKeys.lists(orgId),
      });
      const listKey = organizationMembershipKeys.list(orgId, {});
      const prev = qc.getQueryData<OrganizationMembershipArray>(listKey);
      // Capture previous org detail & org list envelopes for rollback
      const prevOrgDetail = qc.getQueryData<Organization>(orgKeys.byId(orgId));
      const prevOrgLists = qc.getQueriesData<{
        data: OrganizationArray;
        meta: unknown;
      }>({ queryKey: orgKeys.lists() });
      if (prev) {
        // optimistic add (temporary id negative)
        qc.setQueryData(listKey, [
          ...prev,
          {
            id: -Date.now(),
            userId: (input as any).userId,
            roles: input.roles,
          } as OrganizationMembership,
        ]);
      }
      // Optimistically bump membersCount in organization detail
      if (prevOrgDetail) {
        qc.setQueryData(orgKeys.byId(orgId), {
          ...prevOrgDetail,
          membersCount: (prevOrgDetail.membersCount || 0) + 1,
        });
      }
      // Optimistically bump membersCount in any cached list envelopes
      prevOrgLists.forEach(([key, envelope]) => {
        if (envelope && Array.isArray(envelope.data)) {
          const updated = envelope.data.map((o) =>
            o && (o as any).id === orgId
              ? {
                  ...(o as any),
                  membersCount: ((o as any).membersCount || 0) + 1,
                }
              : o
          );
          qc.setQueryData(key, { ...envelope, data: updated });
        }
      });
      return { prev, listKey, prevOrgDetail, prevOrgLists };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.listKey, ctx.prev);
      if (ctx?.prevOrgDetail)
        qc.setQueryData(orgKeys.byId(orgId), ctx.prevOrgDetail);
      if (Array.isArray(ctx?.prevOrgLists)) {
        ctx.prevOrgLists.forEach((entry) => {
          if (Array.isArray(entry) && entry.length === 2) {
            qc.setQueryData(entry[0], entry[1]);
          }
        });
      }
    },
    onSuccess: (_res) => {
      // Invalidate membership list + organization detail + any user detail or lists
      qc.invalidateQueries({
        queryKey: organizationMembershipKeys.lists(orgId),
      });
      qc.invalidateQueries({ queryKey: orgKeys.byId(orgId) });
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUpdateOrganizationMemberRoles(
  orgId: number,
  membershipId: number
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrganizationMemberRolesInput) =>
      updateOrganizationMemberRoles(orgId, membershipId, input),
    onMutate: async (input) => {
      // optimistic update: adjust list and detail if present
      const listKey = organizationMembershipKeys.list(orgId, {});
      await qc.cancelQueries({ queryKey: listKey });
      const prevList = qc.getQueryData<OrganizationMembershipArray>(listKey);
      if (prevList) {
        qc.setQueryData(
          listKey,
          prevList.map((m) =>
            m.id === membershipId ? { ...m, roles: input.roles } : m
          )
        );
      }
      const detailKey = organizationMembershipKeys.detail(orgId, membershipId);
      const prevDetail = qc.getQueryData<OrganizationMembership>(detailKey);
      if (prevDetail) {
        qc.setQueryData(detailKey, { ...prevDetail, roles: input.roles });
      }
      return { prevList, prevDetail, listKey, detailKey };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prevList) qc.setQueryData(ctx.listKey, ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(ctx.detailKey, ctx.prevDetail);
    },
    onSuccess: (data) => {
      qc.setQueryData(organizationMembershipKeys.detail(orgId, data.id), data);
      qc.invalidateQueries({
        queryKey: organizationMembershipKeys.lists(orgId),
      });
      qc.invalidateQueries({ queryKey: orgKeys.byId(orgId) });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useRemoveOrganizationMember(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) =>
      removeOrganizationMember(orgId, membershipId),
    onMutate: async (membershipId) => {
      const listKey = organizationMembershipKeys.list(orgId, {});
      await qc.cancelQueries({ queryKey: listKey });
      const prevList = qc.getQueryData<OrganizationMembershipArray>(listKey);
      const prevOrgDetail = qc.getQueryData<Organization>(orgKeys.byId(orgId));
      const prevOrgLists = qc.getQueriesData<{
        data: OrganizationArray;
        meta: unknown;
      }>({ queryKey: orgKeys.lists() });
      if (prevList) {
        qc.setQueryData(
          listKey,
          prevList.filter((m) => m.id !== membershipId)
        );
      }
      const detailKey = organizationMembershipKeys.detail(orgId, membershipId);
      const prevDetail = qc.getQueryData<OrganizationMembership>(detailKey);
      // Optimistically decrement counts
      if (prevOrgDetail && prevOrgDetail.membersCount != null) {
        qc.setQueryData(orgKeys.byId(orgId), {
          ...prevOrgDetail,
          membersCount: Math.max(0, (prevOrgDetail.membersCount || 0) - 1),
        });
      }
      prevOrgLists.forEach(([key, envelope]) => {
        if (envelope && Array.isArray(envelope.data)) {
          const updated = envelope.data.map((o) =>
            o && (o as any).id === orgId && (o as any).membersCount != null
              ? {
                  ...(o as any),
                  membersCount: Math.max(0, ((o as any).membersCount || 0) - 1),
                }
              : o
          );
          qc.setQueryData(key, { ...envelope, data: updated });
        }
      });
      return {
        prevList,
        listKey,
        prevDetail,
        detailKey,
        prevOrgDetail,
        prevOrgLists,
      };
    },
    onError: (_e, membershipId, ctx) => {
      if (ctx?.prevList) qc.setQueryData(ctx.listKey, ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(ctx.detailKey, ctx.prevDetail);
      if (ctx?.prevOrgDetail)
        qc.setQueryData(orgKeys.byId(orgId), ctx.prevOrgDetail);
      if (Array.isArray(ctx?.prevOrgLists)) {
        ctx.prevOrgLists.forEach((entry) => {
          if (Array.isArray(entry) && entry.length === 2) {
            qc.setQueryData(entry[0], entry[1]);
          }
        });
      }
    },
    onSuccess: (_res, membershipId) => {
      qc.invalidateQueries({
        queryKey: organizationMembershipKeys.lists(orgId),
      });
      qc.removeQueries({
        queryKey: organizationMembershipKeys.detail(orgId, membershipId),
      });
      qc.invalidateQueries({ queryKey: orgKeys.byId(orgId) });
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}
