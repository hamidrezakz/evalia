import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(dto: any) {
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
      },
    });
  }

  async list(query: any) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.state) where.state = query.state;
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

  async getById(id: number) {
    const tpl = await this.prisma.assessmentTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!tpl) throw new NotFoundException('Template not found');
    return tpl;
  }

  async getFull(id: number) {
    const tpl = await this.getById(id);
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

  async update(id: number, dto: any) {
    const existing = await this.getById(id);
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

  async softDelete(id: number) {
    await this.getById(id);
    return this.prisma.assessmentTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
