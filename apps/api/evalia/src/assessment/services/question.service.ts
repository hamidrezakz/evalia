import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    // Validate bank exists
    const bank = await this.prisma.questionBank.findFirst({
      where: { id: dto.bankId, deletedAt: null },
    });
    if (!bank) throw new BadRequestException('Invalid bankId');
    // If optionSetId provided verify existence
    if (dto.optionSetId) {
      const os = await this.prisma.optionSet.findFirst({
        where: { id: dto.optionSetId, deletedAt: null },
      });
      if (!os) throw new BadRequestException('Invalid optionSetId');
    }
    const question = await this.prisma.question.create({
      data: {
        bankId: dto.bankId,
        code: dto.code || null,
        text: dto.text,
        type: dto.type,
        optionSetId: dto.optionSetId || null,
        minScale: dto.minScale || null,
        maxScale: dto.maxScale || null,
        meta: dto.meta || {},
      },
    });
    if (dto.options && Array.isArray(dto.options) && !dto.optionSetId) {
      await this.prisma.$transaction(
        dto.options.map((o: any, idx: number) =>
          this.prisma.questionOption.create({
            data: {
              questionId: question.id,
              value: o.value,
              label: o.label,
              order: o.order ?? idx,
            },
          }),
        ),
      );
    }
    return this.getById(question.id);
  }

  async list(query: any) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const where: any = { deletedAt: null };
    if (query.bankId) where.bankId = Number(query.bankId);
    if (query.type) where.type = query.type;
    if (query.search)
      where.text = { contains: query.search, mode: 'insensitive' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { options: true, optionSet: { include: { options: true } } },
      }),
      this.prisma.question.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async getById(id: number) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: { options: true, optionSet: { include: { options: true } } },
    });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async update(id: number, dto: any) {
    const existing = await this.getById(id);
    if (dto.optionSetId && dto.options) {
      throw new BadRequestException(
        'Provide either optionSetId or inline options, not both',
      );
    }
    if (dto.optionSetId) {
      const os = await this.prisma.optionSet.findFirst({
        where: { id: dto.optionSetId, deletedAt: null },
      });
      if (!os) throw new BadRequestException('Invalid optionSetId');
    }
    await this.prisma.question.update({
      where: { id },
      data: {
        code: dto.code ?? existing.code,
        text: dto.text ?? existing.text,
        type: dto.type ?? existing.type,
        optionSetId:
          dto.optionSetId !== undefined
            ? dto.optionSetId
            : existing.optionSetId,
        minScale: dto.minScale !== undefined ? dto.minScale : existing.minScale,
        maxScale: dto.maxScale !== undefined ? dto.maxScale : existing.maxScale,
        meta: dto.meta !== undefined ? dto.meta : existing.meta,
      },
    });
    if (!dto.optionSetId && dto.options) {
      // Replace inline options
      await this.prisma.questionOption.deleteMany({
        where: { questionId: id },
      });
      await this.prisma.$transaction(
        dto.options.map((o: any, idx: number) =>
          this.prisma.questionOption.create({
            data: {
              questionId: id,
              value: o.value,
              label: o.label,
              order: o.order ?? idx,
            },
          }),
        ),
      );
    }
    return this.getById(id);
  }

  async softDelete(id: number) {
    await this.getById(id);
    return this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
