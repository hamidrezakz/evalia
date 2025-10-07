import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OptionSetAccessLevel } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OptionSetService {
  constructor(private readonly prisma: PrismaService) {}

  private levelRank(level: OptionSetAccessLevel): number {
    switch (level) {
      case 'USE':
        return 1;
      case 'EDIT':
        return 2;
      case 'ADMIN':
        return 3;
      default:
        return 0;
    }
  }

  private async getAccessibleSetOrThrow(
    id: number,
    orgId: number,
    minLevel: OptionSetAccessLevel = 'USE',
  ) {
    const set = await this.prisma.optionSet.findFirst({
      where: { id, deletedAt: null },
      include: { orgLinks: { where: { organizationId: orgId } } },
    });
    if (!set) throw new NotFoundException('OptionSet not found');
    if (set.createdByOrganizationId === orgId) return set;
    const link = set.orgLinks[0];
    if (!link)
      throw new ForbiddenException('Resource not in this organization');
    if (this.levelRank(link.accessLevel) < this.levelRank(minLevel))
      throw new ForbiddenException('Insufficient access level');
    return set;
  }

  async create(dto: any, orgId: number, _actorUserId?: number) {
    const set = await this.prisma.optionSet.create({
      data: {
        name: dto.name,
        code: dto.code || null,
        description: dto.description || null,
        isSystem: !!dto.isSystem,
        meta: dto.meta || {},
        createdByOrganizationId: orgId,
        orgLinks: {
          create: { organizationId: orgId, accessLevel: 'ADMIN' },
        },
      },
    });
    if (dto.options && Array.isArray(dto.options)) {
      await this.prisma.$transaction(
        dto.options.map((o: any, idx: number) =>
          this.prisma.optionSetOption.create({
            data: {
              optionSetId: set.id,
              value: o.value,
              label: o.label,
              order: o.order ?? idx,
              meta: o.meta || {},
            },
          }),
        ),
      );
    }
    return this.getById(set.id, orgId, _actorUserId);
  }

  async list(query: any, orgId: number, _actorUserId?: number) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const orgScope: any = {
      OR: [
        { createdByOrganizationId: orgId },
        { orgLinks: { some: { organizationId: orgId } } },
      ],
    };
    const searchCond = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const where: any = {
      deletedAt: null,
      AND: [orgScope, ...(searchCond ? [searchCond] : [])],
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.optionSet.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { options: true },
      }),
      this.prisma.optionSet.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async getById(id: number, orgId: number, _actorUserId?: number) {
    const set = await this.getAccessibleSetOrThrow(id, orgId, 'USE');
    const withRels = await this.prisma.optionSet.findUnique({
      where: { id: set.id },
      include: { options: true, questions: { select: { id: true } } },
    });
    return withRels!;
  }

  async update(id: number, dto: any, orgId: number, _actorUserId?: number) {
    await this.getAccessibleSetOrThrow(id, orgId, 'EDIT');
    await this.prisma.optionSet.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        isSystem: dto.isSystem,
        meta: dto.meta,
      },
    });
    if (dto.options) {
      // Replace options wholesale
      await this.prisma.optionSetOption.deleteMany({
        where: { optionSetId: id },
      });
      await this.prisma.$transaction(
        dto.options.map((o: any, idx: number) =>
          this.prisma.optionSetOption.create({
            data: {
              optionSetId: id,
              value: o.value,
              label: o.label,
              order: o.order ?? idx,
              meta: o.meta || {},
            },
          }),
        ),
      );
    }
    return this.getById(id, orgId, _actorUserId);
  }

  async softDelete(id: number, orgId: number, _actorUserId?: number) {
    await this.getAccessibleSetOrThrow(id, orgId, 'ADMIN');
    return this.prisma.optionSet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
