/**
 * Session invite link React Query hooks.
 * Responsibilities:
 * - Fetch list of invite links for a session (scoped by org & session)
 * - Create new links (invalidates list)
 * - Consume link (separate mutation – typically used in a landing / redirect page)
 * - Provide enrichment helper to derive status & remaining uses client‑side
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSessionInviteLinks,
  createSessionInviteLink,
  consumeInviteLink,
  updateSessionInviteLink,
  type CreateInviteLinkBody,
  type SessionInviteLinkDto,
  type UpdateInviteLinkBody,
} from "./invite-links.api";

export const inviteLinksKeys = {
  all: ["invite-links"] as const,
  list: (orgId: number | null, sessionId: number | null) =>
    ["invite-links", orgId || "no-org", sessionId || "no-session"] as const,
};

export function useSessionInviteLinks(
  orgId: number | null,
  sessionId: number | null
) {
  return useQuery({
    queryKey: inviteLinksKeys.list(orgId, sessionId),
    queryFn: async () => {
      if (!orgId || !sessionId) return { data: [] };
      return listSessionInviteLinks(orgId, sessionId);
    },
    enabled: !!orgId && !!sessionId,
    staleTime: 10 * 1000,
  });
}

export function useCreateSessionInviteLink(
  orgId: number | null,
  sessionId: number | null
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInviteLinkBody) => {
      if (!orgId || !sessionId) throw new Error("missing orgId/sessionId");
      return createSessionInviteLink(orgId, sessionId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: inviteLinksKeys.list(orgId, sessionId),
      });
    },
  });
}

export function useConsumeInviteLink() {
  return useMutation({
    mutationFn: (token: string) => consumeInviteLink(token),
  });
}

export function useUpdateSessionInviteLink(
  orgId: number | null,
  sessionId: number | null
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; body: UpdateInviteLinkBody }) => {
      if (!orgId || !sessionId) throw new Error("missing orgId/sessionId");
      return updateSessionInviteLink(orgId, sessionId, params.id, params.body);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: inviteLinksKeys.list(orgId, sessionId),
      });
    },
  });
}

export type EnrichedInviteLink = SessionInviteLinkDto & {
  url?: string;
  usedCount?: number;
  status: "active" | "expired" | "disabled" | "exhausted";
  remaining?: number | null;
};

export function enrichInviteLinks(
  raw: SessionInviteLinkDto[]
): EnrichedInviteLink[] {
  const now = Date.now();
  return raw.map((l) => {
    const used = l.usedCount || 0;
    const exhausted = typeof l.maxUses === "number" && used >= l.maxUses;
    const expired = !!l.expiresAt && new Date(l.expiresAt).getTime() < now;
    let status: EnrichedInviteLink["status"] = "active";
    if (!l.enabled) status = "disabled";
    else if (expired) status = "expired";
    else if (exhausted) status = "exhausted";
    const remaining =
      typeof l.maxUses === "number" ? Math.max(0, l.maxUses - used) : null;
    return { ...l, status, remaining };
  });
}
