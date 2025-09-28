import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class QuestionBankService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    const bank = await this.prisma.questionBank.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        isSystem: !!dto.isSystem,
      },
    });
    return bank;
  }

  async list(query: any) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const where: any = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.questionBank.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.questionBank.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async getById(id: number) {
    const bank = await this.prisma.questionBank.findFirst({
      where: { id, deletedAt: null },
    });
    if (!bank) throw new NotFoundException('QuestionBank not found');
    return bank;
  }

  async update(id: number, dto: any) {
    await this.getById(id);
    return this.prisma.questionBank.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isSystem: dto.isSystem,
      },
    });
  }

  async softDelete(id: number) {
    await this.getById(id);
    return this.prisma.questionBank.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countQuestions(bankId: number) {
    // تأیید وجود بانک (می‌توان برای سبک‌تر بودن حذف کرد ولی خطای شفاف بهتر است)
    const bank = await this.prisma.questionBank.findFirst({
      where: { id: bankId, deletedAt: null },
      select: { id: true },
    });
    if (!bank) throw new NotFoundException('QuestionBank not found');

    const questionsCount = await this.prisma.question.count({
      where: { bankId, deletedAt: null },
    });

    return { bankId, questionsCount };
  }
}
