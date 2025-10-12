import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Prisma,
  OrgPlan,
  OrganizationStatus,
  OrgRole,
  PlatformRole,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations.dto';
import { ChangeOrganizationStatusDto } from './dto/change-org-status.dto';
import { PaginationResult } from './types/pagination-result.type';
import { generateUniqueSlug } from './slug.util';
import { AddCapabilityDto } from './dto/add-capability.dto';
import { RemoveCapabilityDto } from './dto/remove-capability.dto';
import {
  CreateRelationshipDto,
  DeleteRelationshipDto,
} from './dto/relationship.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto, actorUserId?: number) {
    const slug =
      dto.slug ||
      (await generateUniqueSlug(dto.name, (existing) =>
        this.slugExists(existing),
      ));
    try {
      const created = await this.prisma.organization.create({
        data: {
          name: dto.name,
          slug,
          plan: dto.plan ?? 'FREE',
          locale: dto.locale ?? 'FA',
          timezone: dto.timezone ?? 'Asia/Tehran',
          createdById: actorUserId,
        },
      });
      // ...existing code...
      return created;
    } catch (e: any) {
      if (this.isUniqueViolation(e, 'Organization_slug_key')) {
        throw new BadRequestException({
          message: 'Duplicate slug',
          code: 'DUPLICATE_ORG_SLUG',
        });
      }
      throw e;
    }
  }

  async slugExists(slug: string) {
    const c = await this.prisma.organization.count({ where: { slug } });
    return c > 0;
  }

  async list(query: ListOrganizationsQueryDto): Promise<PaginationResult<any>> {
    const { page, pageSize, q, status, plan, orderBy, orderDir } = query;
    const where: Prisma.OrganizationWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(plan ? { plan } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // ...existing code...
    const total = await this.prisma.organization.count({ where });
    const itemsRaw = await this.prisma.organization.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [orderBy || 'createdAt']: orderDir || 'desc' },
      include: { avatarAsset: { select: { url: true } } },
    });

    // Fetch aggregated counts in parallel for listed orgs
    const orgIds = itemsRaw.map((o) => o.id);
    const [memberCounts, teamCounts] = await Promise.all([
      this.prisma.organizationMembership.groupBy({
        by: ['organizationId'],
        where: { organizationId: { in: orgIds }, deletedAt: null },
        _count: { organizationId: true },
      }),
      this.prisma.team.groupBy({
        by: ['organizationId'],
        where: { organizationId: { in: orgIds }, deletedAt: null },
        _count: { organizationId: true },
      }),
    ]);
    const memberCountMap = new Map<number, number>();
    memberCounts.forEach((r: any) =>
      memberCountMap.set(r.organizationId, r._count.organizationId),
    );
    const teamCountMap = new Map<number, number>();
    teamCounts.forEach((r: any) =>
      teamCountMap.set(r.organizationId, r._count.organizationId),
    );
    const items = itemsRaw.map((o) => ({
      id: o.id,
      name: (o as any).name,
      slug: (o as any).slug,
      plan: (o as any).plan,
      status: (o as any).status,
      locale: (o as any).locale,
      timezone: (o as any).timezone,
      billingEmail: (o as any).billingEmail,
      createdAt: (o as any).createdAt,
      deletedAt: (o as any).deletedAt,
      updatedAt: (o as any).updatedAt,
      primaryOwnerId: (o as any).primaryOwnerId,
      settings: (o as any).settings,
      trialEndsAt: (o as any).trialEndsAt,
      lockedAt: (o as any).lockedAt,
      createdById: (o as any).createdById,
      avatarUrl: (o as any).avatarAsset?.url ?? null,
      membersCount: memberCountMap.get(o.id) || 0,
      teamsCount: teamCountMap.get(o.id) || 0,
    }));

    const result = {
      data: items,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    };
    // ...existing code...
    return result;
  }

  async findById(id: number) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: { avatarAsset: { select: { url: true } } },
    });
    if (!org)
      throw new NotFoundException({
        message: 'Organization not found',
        code: 'ORG_NOT_FOUND',
      });
    // Aggregate members + teams summaries
    const [members, teams] = await Promise.all([
      this.prisma.organizationMembership.findMany({
        where: { organizationId: id, deletedAt: null },
        include: { user: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.team.findMany({
        where: { organizationId: id, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    const teamsMemberCounts = await this.prisma.teamMembership
      .groupBy({
        by: ['teamId'],
        where: { team: { organizationId: id }, deletedAt: null },
        _count: { teamId: true },
      })
      .catch(() => [] as any[]);
    const teamMemberCountMap = new Map<number, number>();
    teamsMemberCounts.forEach((r: any) =>
      teamMemberCountMap.set(r.teamId, r._count.teamId),
    );
    return {
      ...org,
      avatarUrl: (org as any).avatarAsset?.url ?? null,
      membersCount: members.length,
      teamsCount: teams.length,
      members: members.map((m) => ({
        id: m.userId,
        userId: m.userId,
        fullName: (m as any).user?.fullName || null,
        name: (m as any).user?.fullName || null,
      })),
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        membersCount: teamMemberCountMap.get(t.id) || 0,
      })),
    };
  }

  async update(id: number, dto: UpdateOrganizationDto) {
    await this.findById(id);
    try {
      return await this.prisma.organization.update({
        where: { id },
        data: { ...dto },
      });
    } catch (e: any) {
      if (this.isUniqueViolation(e, 'Organization_slug_key')) {
        throw new BadRequestException({
          message: 'Duplicate slug',
          code: 'DUPLICATE_ORG_SLUG',
        });
      }
      throw e;
    }
  }

  async softDelete(id: number) {
    await this.findById(id);
    await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    // ...existing code...
    return { success: true };
  }

  async restore(id: number) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: { not: null } },
    });
    if (!org)
      throw new NotFoundException({
        message: 'Organization not deleted or not found',
        code: 'ORG_NOT_FOUND',
      });
    const restored = await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: null },
    });
    // ...existing code...
    return restored;
  }

  async changeStatus(id: number, dto: ChangeOrganizationStatusDto) {
    await this.findById(id);
    const updated = await this.prisma.organization.update({
      where: { id },
      data: { status: dto.status },
    });
    // ...existing code...
    return updated;
  }

  async listForUser(userId: number) {
    // Fetch memberships first to avoid unnecessary large joins
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { userId, deletedAt: null },
      select: { organizationId: true, roles: true, id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (memberships.length === 0) return [];
    const orgIds = memberships.map((m) => m.organizationId);
    const orgs = await this.prisma.organization.findMany({
      where: { id: { in: orgIds }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    // Map roles onto organizations for convenience (optional add later: multiple roles?)
    const map = new Map<number, { roles: string[]; membershipId: number }>();
    memberships.forEach((m) =>
      map.set(m.organizationId, { roles: m.roles, membershipId: m.id }),
    );
    return orgs.map((o) => ({ ...o, membership: map.get(o.id) }));
  }

  private isUniqueViolation(e: any, indexName: string) {
    return (
      e?.code === 'P2002' &&
      Array.isArray(e.meta?.target) &&
      e.meta?.target.includes(indexName)
    );
  }

  // ------------------------------
  // Capabilities
  // ------------------------------
  async listCapabilities(organizationId: number) {
    await this.findById(organizationId);
    const items = await this.prisma.organizationCapabilityAssignment.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });
    return { data: items, message: null };
  }

  async addCapability(organizationId: number, dto: AddCapabilityDto) {
    await this.findById(organizationId);
    const existing =
      await this.prisma.organizationCapabilityAssignment.findFirst({
        where: { organizationId, capability: dto.capability as any },
      });
    if (existing) {
      if (!existing.active) {
        await this.prisma.organizationCapabilityAssignment.update({
          where: { id: existing.id },
          data: { active: true },
        });
      }
      return {
        data: { id: existing.id },
        message: 'قابلیت از قبل ثبت شده بود',
      };
    }
    const created = await this.prisma.organizationCapabilityAssignment.create({
      data: { organizationId, capability: dto.capability as any, active: true },
    });
    return { data: created, message: 'قابلیت با موفقیت افزوده شد' };
  }

  async removeCapability(organizationId: number, dto: RemoveCapabilityDto) {
    await this.findById(organizationId);
    const found = await this.prisma.organizationCapabilityAssignment.findFirst({
      where: { organizationId, capability: dto.capability as any },
    });
    if (!found) return { data: null, message: 'قابلیت یافت نشد' };
    await this.prisma.organizationCapabilityAssignment.delete({
      where: { id: found.id },
    });
    return { data: { id: found.id }, message: 'قابلیت حذف شد' };
  }

  // ------------------------------
  // Relationships (parent-child etc)
  // ------------------------------
  async createRelationship(dto: CreateRelationshipDto) {
    if (dto.parentOrganizationId === dto.childOrganizationId) {
      throw new BadRequestException('Parent and child cannot be same');
    }
    await this.findById(dto.parentOrganizationId);
    await this.findById(dto.childOrganizationId);
    const rel = await this.prisma.organizationRelationship.create({
      data: {
        parentOrganizationId: dto.parentOrganizationId,
        childOrganizationId: dto.childOrganizationId,
        relationshipType: dto.relationshipType as any,
        cascadeResources: dto.cascadeResources ?? true,
      },
    });
    return { data: rel, message: 'رابطه سازمان‌ها ایجاد شد' };
  }

  async deleteRelationship(dto: DeleteRelationshipDto) {
    const existing = await this.prisma.organizationRelationship.findFirst({
      where: {
        parentOrganizationId: dto.parentOrganizationId,
        childOrganizationId: dto.childOrganizationId,
      },
      select: { id: true },
    });
    if (!existing) return { data: null, message: 'رابطه‌ای یافت نشد' };
    await this.prisma.organizationRelationship.delete({
      where: { id: existing.id },
    });
    return { data: { id: existing.id }, message: 'رابطه حذف شد' };
  }

  async listChildren(parentOrganizationId: number) {
    await this.findById(parentOrganizationId);
    const items = await this.prisma.organizationRelationship.findMany({
      where: { parentOrganizationId },
      orderBy: { createdAt: 'asc' },
      include: { child: true },
    } as any);
    return { data: items, message: null };
  }

  async listParents(childOrganizationId: number) {
    await this.findById(childOrganizationId);
    const items = await this.prisma.organizationRelationship.findMany({
      where: { childOrganizationId },
      orderBy: { createdAt: 'asc' },
      include: { parent: true },
    } as any);
    return { data: items, message: null };
  }

  /**
   * List organizations that are a parent in any relationship (distinct parents).
   * Supports pagination and simple filters similar to list().
   */
  async listParentsOnly(query: ListOrganizationsQueryDto) {
    const {
      page = 1,
      pageSize = 20,
      q,
      status,
      plan,
      orderBy,
      orderDir,
    } = query;
    // Get distinct parentOrganizationId values
    const distinctParents = await this.prisma.organizationRelationship.findMany(
      {
        distinct: ['parentOrganizationId'],
        select: { parentOrganizationId: true },
      },
    );
    const parentIds = distinctParents
      .map((r) => r.parentOrganizationId)
      .filter((v): v is number => typeof v === 'number');
    if (parentIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          pageSize,
          pageCount: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
    const where: Prisma.OrganizationWhereInput = {
      id: { in: parentIds },
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(plan ? { plan } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const total = await this.prisma.organization.count({ where });
    const items = await this.prisma.organization.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [orderBy || 'createdAt']: orderDir || 'desc' },
      include: { avatarAsset: { select: { url: true } } },
    });
    return {
      data: items.map((o) => ({
        ...o,
        avatarUrl: (o as any).avatarAsset?.url ?? null,
      })),
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    };
  }
}
