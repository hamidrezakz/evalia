import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  QuestionType,
  ResponsePerspective,
  SessionState,
} from '@prisma/client';

@Injectable()
export class ResponseService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadAssignment(assignmentId: number) {
    const a = await this.prisma.assessmentAssignment.findUnique({
      where: { id: assignmentId },
      include: { session: true, user: true },
    });
    if (!a) throw new BadRequestException('Invalid assignmentId');
    return a;
  }

  private async loadTemplateQuestion(tqId: number) {
    const tq = await this.prisma.assessmentTemplateQuestion.findUnique({
      where: { id: tqId },
      include: {
        section: { include: { template: true } },
        question: {
          include: { options: true, optionSet: { include: { options: true } } },
        },
      },
    });
    if (
      !tq ||
      tq.section.deletedAt ||
      tq.section.template.deletedAt ||
      tq.question.deletedAt
    )
      throw new BadRequestException('Invalid templateQuestionId');
    return tq;
  }

  private ensurePerspectiveAllowed(tq: any, perspective: ResponsePerspective) {
    if (!tq.perspectives.includes(perspective)) {
      throw new BadRequestException(
        'Perspective not allowed for this question',
      );
    }
  }

  private validateQuestionValue(tq: any, dto: any) {
    const q = tq.question;
    switch (q.type as QuestionType) {
      case 'SCALE': {
        if (dto.scaleValue === undefined || dto.scaleValue === null)
          throw new BadRequestException('scaleValue required');
        if (typeof q.minScale === 'number' && dto.scaleValue < q.minScale)
          throw new BadRequestException('scaleValue below min');
        if (typeof q.maxScale === 'number' && dto.scaleValue > q.maxScale)
          throw new BadRequestException('scaleValue above max');
        return {
          scaleValue: dto.scaleValue as number,
          optionValue: null as string | null,
          optionValues: [] as string[],
          textValue: null as string | null,
        };
      }
      case 'TEXT': {
        if (!dto.textValue || !dto.textValue.trim())
          throw new BadRequestException('textValue required');
        return {
          scaleValue: null as number | null,
          optionValue: null as string | null,
          optionValues: [] as string[],
          textValue: dto.textValue.trim() as string,
        };
      }
      case 'BOOLEAN': {
        if (dto.optionValue === undefined)
          throw new BadRequestException(
            'optionValue required ("TRUE" or "FALSE")',
          );
        if (!['TRUE', 'FALSE'].includes(dto.optionValue))
          throw new BadRequestException('optionValue must be TRUE or FALSE');
        return {
          scaleValue: null as number | null,
          optionValue: dto.optionValue as string,
          optionValues: [] as string[],
          textValue: null as string | null,
        };
      }
      case 'SINGLE_CHOICE': {
        if (!dto.optionValue)
          throw new BadRequestException('optionValue required');
        const validValues = q.optionSet
          ? q.optionSet.options.map((o: any) => o.value)
          : q.options.map((o: any) => o.value);
        if (!validValues.includes(dto.optionValue))
          throw new BadRequestException('Invalid optionValue');
        return {
          scaleValue: null as number | null,
          optionValue: dto.optionValue as string,
          optionValues: [] as string[],
          textValue: null as string | null,
        };
      }
      case 'MULTI_CHOICE': {
        if (!Array.isArray(dto.optionValues) || !dto.optionValues.length)
          throw new BadRequestException('optionValues required');
        const validValues = q.optionSet
          ? q.optionSet.options.map((o: any) => o.value)
          : q.options.map((o: any) => o.value);
        for (const v of dto.optionValues)
          if (!validValues.includes(v))
            throw new BadRequestException('Invalid optionValues element: ' + v);
        const unique = Array.from(
          new Set(dto.optionValues.map((v: any) => String(v))),
        );
        return {
          scaleValue: null as number | null,
          optionValue: null as string | null,
          optionValues: unique as string[],
          textValue: null as string | null,
        };
      }
      default:
        throw new BadRequestException('Unsupported question type');
    }
  }

  private ensureSessionStateAllowsResponse(state: SessionState) {
    if (!['SCHEDULED', 'IN_PROGRESS'].includes(state)) {
      throw new BadRequestException('Session not accepting responses');
    }
  }

  async upsert(dto: any) {
    const assignment = await this.loadAssignment(dto.assignmentId);
    if (assignment.sessionId !== dto.sessionId)
      throw new BadRequestException('sessionId mismatch with assignment');
    const tq = await this.loadTemplateQuestion(dto.templateQuestionId);
    if (assignment.session.templateId !== tq.section.templateId)
      throw new BadRequestException('Template mismatch');
    this.ensureSessionStateAllowsResponse(
      assignment.session.state as SessionState,
    );
    this.ensurePerspectiveAllowed(
      tq,
      assignment.perspective as ResponsePerspective,
    );
    const values = this.validateQuestionValue(tq, dto);
    // find existing
    const existing = await this.prisma.assessmentResponse.findFirst({
      where: { assignmentId: assignment.id, templateQuestionId: tq.id },
    });
    if (existing) {
      return this.prisma.assessmentResponse.update({
        where: { id: existing.id },
        data: { ...values },
      });
    }
    return this.prisma.assessmentResponse.create({
      data: {
        assignmentId: assignment.id,
        sessionId: assignment.sessionId,
        templateQuestionId: tq.id,
        ...values,
      },
    });
  }

  async bulkUpsert(dto: any) {
    const results = [];
    for (const item of dto.items) {
      // reuse single logic; sequential to simplify validation errors
      results.push(await this.upsert(item));
    }
    return { count: results.length, items: results };
  }

  async list(query: any) {
    if (!query.sessionId) throw new BadRequestException('sessionId required');
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 50, 200);
    const where: any = { sessionId: Number(query.sessionId) };
    if (query.assignmentId) where.assignmentId = Number(query.assignmentId);
    if (query.templateQuestionId)
      where.templateQuestionId = Number(query.templateQuestionId);
    if (query.questionId) {
      // join filter: need templateQuestion relation
      const tqIds = await this.prisma.assessmentTemplateQuestion.findMany({
        where: { questionId: Number(query.questionId) },
        select: { id: true },
      });
      where.templateQuestionId = { in: tqIds.map((t) => t.id) };
    }
    if (query.perspective) {
      if (
        !['SELF', 'FACILITATOR', 'PEER', 'MANAGER', 'SYSTEM'].includes(
          query.perspective,
        )
      )
        throw new BadRequestException('Invalid perspective');
      // filter via assignment relation later using in query (need assignment ids)
      const assignmentIds = await this.prisma.assessmentAssignment.findMany({
        where: {
          sessionId: Number(query.sessionId),
          perspective: query.perspective as ResponsePerspective,
        },
        select: { id: true },
      });
      where.assignmentId = { in: assignmentIds.map((a) => a.id) };
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.assessmentResponse.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      this.prisma.assessmentResponse.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async get(id: number) {
    const r = await this.prisma.assessmentResponse.findUnique({
      where: { id },
    });
    if (!r) throw new NotFoundException('Response not found');
    return r;
  }

  async remove(id: number) {
    await this.get(id);
    await this.prisma.assessmentResponse.delete({ where: { id } });
    return { id };
  }
}
