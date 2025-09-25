import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ListUsersDto } from './dto/list-users.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(dto: ListUsersDto) {
    const page = dto.page || 1;
    const pageSize = dto.pageSize || 20;
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (dto.id) where.id = dto.id;
    if (dto.status) where.status = dto.status;
    if (dto.statuses && dto.statuses.length)
      where.status = { in: dto.statuses } as any;
    if (dto.q) {
      where.OR = [
        { fullName: { contains: dto.q, mode: 'insensitive' } },
        { email: { contains: dto.q, mode: 'insensitive' } },
        { phoneNormalized: { contains: dto.q } },
      ];
    }
    if (dto.orgId) {
      where.memberships = {
        some: { organizationId: dto.orgId, deletedAt: null },
      };
    }
    if (dto.teamName) {
      where.teams = {
        some: {
          team: { name: { contains: dto.teamName, mode: 'insensitive' } },
        },
      } as any;
    }

    // Date range filters
    if (dto.createdAtFrom || dto.createdAtTo) {
      where.createdAt = {} as any;
      if (dto.createdAtFrom)
        (where.createdAt as any).gte = new Date(dto.createdAtFrom);
      if (dto.createdAtTo)
        (where.createdAt as any).lte = new Date(dto.createdAtTo);
    }

    // Sorting
    let orderBy: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput> = {
      createdAt: 'desc',
    };
    if (dto.sort) {
      const parts = dto.sort
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const parsed: Prisma.UserOrderByWithRelationInput[] = [];
      for (const p of parts) {
        const [fieldRaw, dirRaw] = p.split(':');
        const field = fieldRaw as keyof Prisma.UserOrderByWithRelationInput;
        if (!field) continue;
        const dir = dirRaw && dirRaw.toLowerCase() === 'asc' ? 'asc' : 'desc';
        // allowlist fields
        if (['createdAt', 'fullName', 'status', 'id'].includes(field)) {
          parsed.push({ [field]: dir } as any);
        }
      }
      if (parsed.length) orderBy = parsed;
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNormalized: true,
          status: true,
          globalRoles: true,
          createdAt: true,
          memberships: {
            where: { deletedAt: null },
            select: { organizationId: true, roles: true },
          },
          teams: {
            where: { deletedAt: null },
            select: {
              team: { select: { id: true, name: true, organizationId: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phoneNormalized,
        status: u.status,
        globalRoles: u.globalRoles,
        organizations: u.memberships.map((m) => ({
          orgId: m.organizationId,
          roles: m.roles,
        })),
        teams: u.teams.map((t) => t.team),
        createdAt: u.createdAt,
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

  async detail(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNormalized: true,
        status: true,
        globalRoles: true,
        avatarAsset: { select: { url: true } },
        createdAt: true,
        memberships: {
          where: { deletedAt: null },
          select: {
            id: true,
            organizationId: true,
            roles: true,
            createdAt: true,
          },
        },
        teams: {
          where: { deletedAt: null },
          select: {
            team: { select: { id: true, name: true, organizationId: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarAsset?.url ?? null,
      phone: user.phoneNormalized,
      status: user.status,
      globalRoles: user.globalRoles,
      createdAt: user.createdAt,
      organizations: user.memberships.map((m) => ({
        membershipId: m.id,
        orgId: m.organizationId,
        roles: m.roles,
        joinedAt: m.createdAt,
      })),
      teams: user.teams.map((t) => t.team),
    };
  }

  async update(id: number, body: any) {
    // Allow only a safe subset of fields
    const data: any = {};
    if (body.fullName !== undefined)
      data.fullName = String(body.fullName || '');
    if (body.status !== undefined) data.status = body.status;
    if (body.avatarAssetId !== undefined) {
      const n = Number(body.avatarAssetId);
      if (!Number.isInteger(n) || n <= 0)
        throw new NotFoundException('Invalid avatarAssetId');
      // ensure asset exists
      const asset = await this.prisma.asset.findFirst({
        where: { id: n, deletedAt: null },
      });
      if (!asset) throw new NotFoundException('Asset not found');
      data.avatarAssetId = n;
    }
    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.detail(updated.id);
  }
}
