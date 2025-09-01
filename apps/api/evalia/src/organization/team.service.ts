import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddTeamDto } from './dto/add-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { generateUniqueSlug } from './slug.util';
import { CacheService } from '../common/cache.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  private async orgExists(orgId: number) {
    const org = await this.prisma.organization.findFirst({
      where: { id: orgId, deletedAt: null },
    });
    if (!org)
      throw new NotFoundException({
        message: 'Organization not found',
        code: 'ORG_NOT_FOUND',
      });
    return org;
  }

  async create(orgId: number, dto: AddTeamDto) {
    await this.orgExists(orgId);
    const baseSlug = dto.slug || dto.name;
    const slug = await generateUniqueSlug(baseSlug, async (candidate) => {
      const c = await this.prisma.team.count({
        where: { organizationId: orgId, slug: candidate },
      });
      return c > 0;
    });
    try {
      const created = await this.prisma.team.create({
        data: {
          organizationId: orgId,
          name: dto.name,
          slug,
          description: dto.description,
        },
      });
      await this.cache.invalidatePrefix(`team:list:${orgId}:`);
      return created;
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException({
          message: 'Duplicate team slug',
          code: 'DUPLICATE_TEAM_SLUG',
        });
      }
      throw e;
    }
  }

  async list(
    orgId: number,
    page = 1,
    pageSize = 20,
    q?: string,
    includeDeleted = false,
  ) {
    await this.orgExists(orgId);
    const where: any = { organizationId: orgId };
    if (!includeDeleted) where.deletedAt = null;
    if (q)
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    const cacheKey = `team:list:${orgId}:${this.cache.hashObject({ page, pageSize, q, includeDeleted })}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;
    const total = await this.prisma.team.count({ where });
    const items = await this.prisma.team.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
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
    await this.cache.set(cacheKey, result, 60);
    return result;
  }

  async get(orgId: number, teamId: number) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId: orgId },
    });
    if (!team || team.deletedAt)
      throw new NotFoundException({
        message: 'Team not found',
        code: 'TEAM_NOT_FOUND',
      });
    return team;
  }

  async update(orgId: number, teamId: number, dto: UpdateTeamDto) {
    await this.get(orgId, teamId);
    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { name: dto.name, description: dto.description },
    });
    await this.cache.invalidatePrefix(`team:list:${orgId}:`);
    return updated;
  }

  async softDelete(orgId: number, teamId: number) {
    await this.get(orgId, teamId);
    await this.prisma.team.update({
      where: { id: teamId },
      data: { deletedAt: new Date() },
    });
    await this.cache.invalidatePrefix(`team:list:${orgId}:`);
    return { success: true };
  }

  async restore(orgId: number, teamId: number) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId: orgId, deletedAt: { not: null } },
    });
    if (!team)
      throw new NotFoundException({
        message: 'Team not found or not deleted',
        code: 'TEAM_NOT_FOUND',
      });
    const restored = await this.prisma.team.update({
      where: { id: teamId },
      data: { deletedAt: null },
    });
    await this.cache.invalidatePrefix(`team:list:${orgId}:`);
    return restored;
  }
}
