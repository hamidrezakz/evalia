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
      ...o,
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
}
