import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OptionSetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    const set = await this.prisma.optionSet.create({
      data: {
        name: dto.name,
        code: dto.code || null,
        description: dto.description || null,
        isSystem: !!dto.isSystem,
        meta: dto.meta || {},
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
    return this.getById(set.id);
  }

  async list(query: any) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }
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

  async getById(id: number) {
    const set = await this.prisma.optionSet.findFirst({
      where: { id, deletedAt: null },
      include: { options: true, questions: { select: { id: true } } },
    });
    if (!set) throw new NotFoundException('OptionSet not found');
    return set;
  }

  async update(id: number, dto: any) {
    await this.getById(id);
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
    return this.getById(id);
  }

  async softDelete(id: number) {
    await this.getById(id);
    return this.prisma.optionSet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
