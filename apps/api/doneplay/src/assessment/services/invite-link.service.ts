import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { randomBytes } from 'crypto';
import {
  OrgRole,
  Prisma,
  ResponsePerspective,
  SessionInviteLink,
} from '@prisma/client';

@Injectable()
export class InviteLinkService {
  constructor(private readonly prisma: PrismaService) {}

  private token() {
    return randomBytes(32).toString('base64url');
  }

  async create(dto: {
    organizationId: number;
    sessionId: number;
    userId: number;
    label?: string;
    expiresAt?: string | Date | null;
    maxUses?: number | null;
    autoJoinOrg?: boolean;
    autoAssignSelf?: boolean;
    allowedDomains?: string[];
    enabled?: boolean;
  }) {
    // Validate session belongs to org
    const s = await this.prisma.assessmentSession.findFirst({
      where: {
        id: dto.sessionId,
        organizationId: dto.organizationId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!s) throw new BadRequestException('Session not found in org');
    const token = this.token();
    const link = await this.prisma.sessionInviteLink.create({
      data: {
        token,
        organizationId: dto.organizationId,
        sessionId: dto.sessionId,
        createdByUserId: dto.userId,
        label: dto.label ?? null,
        enabled: dto.enabled ?? true,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        maxUses: dto.maxUses ?? null,
        autoJoinOrg: dto.autoJoinOrg ?? true,
        autoAssignSelf: dto.autoAssignSelf ?? true,
        allowedDomains: Array.isArray(dto.allowedDomains)
          ? dto.allowedDomains
          : [],
      },
    });
    return { data: { ...link, url: `/invite/${token}` } };
  }

  async list(orgId: number, sessionId: number) {
    const links = await this.prisma.sessionInviteLink.findMany({
      where: { organizationId: orgId, sessionId },
      orderBy: { createdAt: 'desc' },
    });
    const uses = await this.prisma.sessionInviteLinkUse.groupBy({
      by: ['linkId'],
      _count: { _all: true },
      where: { link: { organizationId: orgId, sessionId } },
    });
    const useMap = new Map<number, number>();
    for (const u of uses as Array<{
      linkId: number;
      _count: { _all: number };
    }>) {
      useMap.set(u.linkId, u._count._all);
    }
    return {
      data: links.map((l: SessionInviteLink) => ({
        ...l,
        usedCount: useMap.get(l.id) || 0,
      })),
    };
  }

  private checkAllowed(email?: string | null, domains?: string[]): boolean {
    if (!domains || domains.length === 0) return true;
    if (!email) return false;
    const at = email.lastIndexOf('@');
    if (at < 0) return false;
    const domain = email.slice(at + 1).toLowerCase();
    return domains.some((d) => domain === d.toLowerCase());
  }

  async consume(token: string, userId?: number) {
    if (!token) throw new BadRequestException('token required');
    if (!userId) throw new ForbiddenException('authentication required');
    const link = await this.prisma.sessionInviteLink.findFirst({
      where: { token },
    });
    if (!link || !link.enabled)
      throw new ForbiddenException('link disabled or invalid');
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      throw new BadRequestException('expired');
    }
    if (link.maxUses != null) {
      const count = await this.prisma.sessionInviteLinkUse.count({
        where: { linkId: link.id },
      });
      if (count >= link.maxUses) throw new BadRequestException('exhausted');
    }
    // domain restriction
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('user not found');
    if (!this.checkAllowed(user.email || null, link.allowedDomains)) {
      throw new ForbiddenException('domain_mismatch');
    }
    // auto-join org
    if (link.autoJoinOrg) {
      const existing = await this.prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: link.organizationId,
          },
        },
        select: { id: true },
      });
      if (!existing) {
        await this.prisma.organizationMembership.create({
          data: {
            userId,
            organizationId: link.organizationId,
            roles: ['MEMBER' as OrgRole],
          },
        });
      }
    }
    // auto-assign self
    let assignmentCreated = false;
    if (link.autoAssignSelf) {
      // Check existing assignment (including soft-deleted)
      const existingA = await this.prisma.assessmentAssignment.findUnique({
        where: {
          sessionId_respondentUserId_subjectUserId_perspective: {
            sessionId: link.sessionId,
            respondentUserId: userId,
            subjectUserId: userId,
            perspective: 'SELF',
          },
        },
        select: { id: true, deletedAt: true },
      });
      assignmentCreated = !existingA || !!existingA.deletedAt;
      await this.prisma.assessmentAssignment.upsert({
        where: {
          sessionId_respondentUserId_subjectUserId_perspective: {
            sessionId: link.sessionId,
            respondentUserId: userId,
            subjectUserId: userId,
            perspective: 'SELF',
          },
        },
        update: { deletedAt: null },
        create: {
          sessionId: link.sessionId,
          respondentUserId: userId,
          subjectUserId: userId,
          perspective: 'SELF',
        },
      });
    }
    // log use (idempotent per user)
    await this.prisma.sessionInviteLinkUse.upsert({
      where: { linkId_userId: { linkId: link.id, userId } },
      create: { linkId: link.id, userId },
      update: {},
    });
    return {
      data: {
        organizationId: link.organizationId,
        sessionId: link.sessionId,
        assignmentCreated,
        redirectTo: `/dashboard/tests/take?sessionId=${link.sessionId}&perspective=SELF`,
      },
    };
  }

  // Lightweight, unauthenticated lookup for invite token metadata
  // Returns minimal info to enable client-side redirects without consuming the link
  async resolve(token: string) {
    if (!token) throw new BadRequestException('token required');
    const link = await this.prisma.sessionInviteLink.findFirst({
      where: { token },
      select: {
        enabled: true,
        expiresAt: true,
        organizationId: true,
        sessionId: true,
      },
    });
    if (!link || !link.enabled) throw new NotFoundException('link not found');
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      throw new BadRequestException('expired');
    }
    const org = await this.prisma.organization.findUnique({
      where: { id: link.organizationId },
      select: { id: true, slug: true, name: true },
    });
    if (!org) throw new NotFoundException('org not found');
    return {
      data: {
        organizationId: org.id,
        organizationSlug: org.slug,
        organizationName: org.name,
        sessionId: link.sessionId,
      },
    };
  }

  async update(
    orgId: number,
    sessionId: number,
    id: number,
    dto: {
      label?: string | null;
      enabled?: boolean;
      autoJoinOrg?: boolean;
      autoAssignSelf?: boolean;
      expiresAt?: string | null;
      maxUses?: number | null;
      allowedDomains?: string[];
    },
  ) {
    const link = await this.prisma.sessionInviteLink.findFirst({
      where: { id, organizationId: orgId, sessionId },
    });
    if (!link) throw new NotFoundException('link not found');
    const data: Prisma.SessionInviteLinkUpdateInput = {};
    if (dto.label !== undefined) data.label = dto.label;
    if (dto.enabled !== undefined) data.enabled = dto.enabled;
    if (dto.autoJoinOrg !== undefined) data.autoJoinOrg = dto.autoJoinOrg;
    if (dto.autoAssignSelf !== undefined)
      data.autoAssignSelf = dto.autoAssignSelf;
    if (dto.expiresAt !== undefined)
      data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.maxUses !== undefined) data.maxUses = dto.maxUses;
    if (dto.allowedDomains !== undefined)
      data.allowedDomains = Array.isArray(dto.allowedDomains)
        ? dto.allowedDomains
        : [];
    const updated = await this.prisma.sessionInviteLink.update({
      where: { id: link.id },
      data,
    });
    return { data: updated };
  }
}
