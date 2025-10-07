import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TemplateAccessLevel } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
// lightweight random suffix generator (avoid external dep if nanoid not installed)
import { randomBytes } from 'crypto';

const SLUG_SAFE = /[^a-z0-9-]+/g;
function nanoid(len = 6) {
  return randomBytes(len).toString('base64url').slice(0, len);
}

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  private genSlug(name: string) {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(SLUG_SAFE, '')
        .slice(0, 70) +
      '-' +
      nanoid(6)
    );
  }

  private levelRank(level: TemplateAccessLevel): number {
    switch (level) {
      case 'USE':
        return 1;
      case 'CLONE':
        return 1; // treat as read for now
      case 'EDIT':
        return 2;
      case 'ADMIN':
        return 3;
      default:
        return 0;
    }
  }

  private async getAccessibleTemplateOrThrow(
    id: number,
    orgId: number,
    minLevel: TemplateAccessLevel = 'USE',
  ) {
    const tpl = await this.prisma.assessmentTemplate.findFirst({
      where: { id, deletedAt: null },
      include: { orgLinks: { where: { organizationId: orgId } } },
    });
    if (!tpl) throw new NotFoundException('Template not found');
    if (tpl.createdByOrganizationId === orgId) return tpl;
    const link = tpl.orgLinks[0];
    if (!link)
      throw new ForbiddenException('Resource not in this organization');
    if (this.levelRank(link.accessLevel) < this.levelRank(minLevel))
      throw new ForbiddenException('Insufficient access level');
    return tpl;
  }

  async create(dto: any, orgId: number, _actorUserId?: number) {
    const slug = dto.slug ? dto.slug : this.genSlug(dto.name);
    const exists = await this.prisma.assessmentTemplate.findUnique({
      where: { slug },
    });
    if (exists) throw new BadRequestException('Slug already exists');
    return this.prisma.assessmentTemplate.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description || null,
        meta: dto.meta || {},
        createdByOrganizationId: orgId,
        orgLinks: { create: { organizationId: orgId, accessLevel: 'ADMIN' } },
      },
    });
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
            { slug: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const stateCond = query.state ? { state: query.state } : undefined;
    const where: any = {
      deletedAt: null,
      AND: [
        orgScope,
        ...(searchCond ? [searchCond] : []),
        ...(stateCond ? [stateCond] : []),
      ],
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.assessmentTemplate.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assessmentTemplate.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async getById(id: number, orgId: number, _actorUserId?: number) {
    return this.getAccessibleTemplateOrThrow(id, orgId, 'USE');
  }

  async getFull(id: number, orgId: number, _actorUserId?: number) {
    const tpl = await this.getById(id, orgId, _actorUserId);
    const sections = await this.prisma.assessmentTemplateSection.findMany({
      where: { templateId: id, deletedAt: null },
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: {
              include: {
                options: true,
                optionSet: { include: { options: true } },
              },
            },
          },
        },
      },
    });
    return { ...tpl, sections } as any;
  }

  async update(id: number, dto: any, orgId: number, _actorUserId?: number) {
    const existing = await this.getAccessibleTemplateOrThrow(id, orgId, 'EDIT');
    if (dto.slug && dto.slug !== existing.slug) {
      const s = await this.prisma.assessmentTemplate.findUnique({
        where: { slug: dto.slug },
      });
      if (s) throw new BadRequestException('Slug already exists');
    }
    if (
      existing.state !== 'DRAFT' &&
      dto.state &&
      dto.state !== existing.state
    ) {
      if (dto.state === 'DRAFT')
        throw new BadRequestException('Cannot revert to DRAFT');
    }
    return this.prisma.assessmentTemplate.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        slug: dto.slug ?? existing.slug,
        description:
          dto.description !== undefined
            ? dto.description
            : existing.description,
        state: dto.state ?? existing.state,
        meta: dto.meta !== undefined ? dto.meta : existing.meta,
      },
    });
  }

  async softDelete(id: number, orgId: number, _actorUserId?: number) {
    await this.getAccessibleTemplateOrThrow(id, orgId, 'ADMIN');
    return this.prisma.assessmentTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
