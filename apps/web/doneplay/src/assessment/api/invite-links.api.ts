import { apiRequest } from "@/lib/api.client";

// Base paths follow backend controller:
// POST /invite-links/org/:orgId/session/:sessionId  (create)
// GET  /invite-links/org/:orgId/session/:sessionId  (list)
// POST /invite-links/consume { token }

export interface SessionInviteLinkDto {
  id: number;
  token: string;
  organizationId: number;
  sessionId: number;
  createdByUserId: number;
  label?: string | null;
  enabled: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  autoJoinOrg: boolean;
  autoAssignSelf: boolean;
  allowedDomains: string[];
  createdAt: string;
  updatedAt: string;
  usedCount?: number; // enriched client-side
}

export interface CreateInviteLinkBody {
  label?: string | null;
  expiresAt?: string | null;
  maxUses?: number | null;
  autoJoinOrg?: boolean;
  autoAssignSelf?: boolean;
  allowedDomains?: string[];
  enabled?: boolean;
}

export async function createSessionInviteLink(
  orgId: number,
  sessionId: number,
  body: CreateInviteLinkBody
): Promise<{ data: SessionInviteLinkDto & { url: string } }> {
  const res = await apiRequest<{
    data: SessionInviteLinkDto & { url: string };
  }>(`/invite-links/org/${orgId}/session/${sessionId}`, null, null, { body });
  return res as any;
}

export async function listSessionInviteLinks(
  orgId: number,
  sessionId: number
): Promise<{ data: (SessionInviteLinkDto & { url?: string })[] }> {
  const res = await apiRequest<{
    data: (SessionInviteLinkDto & { url?: string })[];
  }>(`/invite-links/org/${orgId}/session/${sessionId}`, null, null);
  return res as any;
}

export async function consumeInviteLink(token: string) {
  return apiRequest(`/invite-links/consume`, null, null, { body: { token } });
}

export async function resolveInviteLink(token: string) {
  return apiRequest(
    `/invite-links/resolve/${encodeURIComponent(token)}`,
    null,
    null,
    {
      auth: false,
    }
  );
}

export interface UpdateInviteLinkBody {
  label?: string | null;
  enabled?: boolean;
  autoJoinOrg?: boolean;
  autoAssignSelf?: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  allowedDomains?: string[];
}

export async function updateSessionInviteLink(
  orgId: number,
  sessionId: number,
  id: number,
  body: UpdateInviteLinkBody
) {
  // Using POST for update per controller route
  return apiRequest(
    `/invite-links/org/${orgId}/session/${sessionId}/${id}`,
    null,
    null,
    { body }
  );
}
