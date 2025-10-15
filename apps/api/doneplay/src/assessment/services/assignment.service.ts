import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ResponsePerspective } from '@prisma/client';

const PERSPECTIVES: ResponsePerspective[] = [
  'SELF',
  'FACILITATOR',
  'PEER',
  'MANAGER',
  'SYSTEM',
];

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSession(sessionId: number) {
    const s = await this.prisma.assessmentSession.findFirst({
      where: { id: sessionId, deletedAt: null },
    });
    if (!s) throw new BadRequestException('Invalid sessionId');
    return s;
  }

  private async ensureUser(userId: number) {
    const u = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!u) throw new BadRequestException('Invalid userId');
    return u;
  }

  private validatePerspective(p?: string): ResponsePerspective {
    if (!p) return 'SELF';
    if (!PERSPECTIVES.includes(p as ResponsePerspective))
      throw new BadRequestException('Invalid perspective');
    return p as ResponsePerspective;
  }

  async add(dto: any) {
    await this.ensureSession(dto.sessionId);
    const respondentUserId = dto.respondentUserId ?? dto.userId;
    if (!respondentUserId)
      throw new BadRequestException('respondentUserId required');
    await this.ensureUser(respondentUserId);
    const perspective = this.validatePerspective(dto.perspective);
    // Default subject = respondent for SELF if not provided
    const subjectUserId =
      dto.subjectUserId ??
      (perspective === 'SELF' ? respondentUserId : undefined);
    if (perspective !== 'SELF' && !subjectUserId)
      throw new BadRequestException('subjectUserId required for non-SELF');
    if (subjectUserId) await this.ensureUser(subjectUserId);
    // Idempotent: restore soft-deleted or no-op if exists, else create
    const subjectKey: number =
      perspective === 'SELF' ? respondentUserId : (subjectUserId as number);
    return this.prisma.assessmentAssignment.upsert({
      where: {
        sessionId_respondentUserId_subjectUserId_perspective: {
          sessionId: dto.sessionId,
          respondentUserId,
          subjectUserId: subjectKey,
          perspective,
        },
      },
      update: { deletedAt: null },
      create: {
        sessionId: dto.sessionId,
        respondentUserId,
        subjectUserId: subjectKey,
        perspective,
      },
    });
  }

  async bulkAssign(dto: any) {
    await this.ensureSession(dto.sessionId);
    const perspective = this.validatePerspective(dto.perspective);

    // Mode A (new): one respondent -> many subjects
    if (dto.respondentUserId && Array.isArray(dto.subjectUserIds)) {
      const respondentUserId = Number(dto.respondentUserId);
      await this.ensureUser(respondentUserId);
      if (perspective === 'SELF')
        throw new BadRequestException('Use userIds for SELF bulk');
      const subjectIds: number[] = Array.from(
        new Set(
          (dto.subjectUserIds as any[])
            .map((n: any) => Number(n))
            .filter((v: any) => Number.isFinite(v)),
        ),
      ) as number[];
      if (!subjectIds.length)
        throw new BadRequestException('subjectUserIds required');
      await Promise.all(subjectIds.map((id: number) => this.ensureUser(id)));
      const existing = await this.prisma.assessmentAssignment.findMany({
        where: { sessionId: dto.sessionId, respondentUserId, perspective },
        select: { subjectUserId: true, deletedAt: true },
      });
      const existingMap = new Map<number, Date | null>();
      for (const e of existing)
        existingMap.set(e.subjectUserId as number, e.deletedAt ?? null);
      const createdCount = subjectIds.filter(
        (sid) => !existingMap.has(sid) || existingMap.get(sid) !== null,
      ).length;
      await this.prisma.$transaction(
        subjectIds.map((subjectUserId: number) =>
          this.prisma.assessmentAssignment.upsert({
            where: {
              sessionId_respondentUserId_subjectUserId_perspective: {
                sessionId: dto.sessionId,
                respondentUserId,
                subjectUserId,
                perspective,
              },
            },
            update: { deletedAt: null },
            create: {
              sessionId: dto.sessionId,
              respondentUserId,
              subjectUserId,
              perspective,
            },
          }),
        ),
      );
      return { created: createdCount };
    }

    // Mode B (legacy / SELF bulk): many respondents -> SELF
    if (!Array.isArray(dto.userIds))
      throw new BadRequestException('userIds required');
    if (perspective !== 'SELF') {
      throw new BadRequestException(
        'For non-SELF bulk, use respondentUserId + subjectUserIds (Mode A).',
      );
    }
    const userIds: number[] = Array.from(
      new Set(
        (dto.userIds as any[])
          .map((n: any) => Number(n))
          .filter((v: any) => Number.isFinite(v)),
      ),
    ) as number[];
    await Promise.all(userIds.map((id: number) => this.ensureUser(id)));
    const results = await this.prisma.$transaction(
      userIds.map((respondentUserId: number) =>
        this.prisma.assessmentAssignment.upsert({
          where: {
            sessionId_respondentUserId_subjectUserId_perspective: {
              sessionId: dto.sessionId,
              respondentUserId,
              subjectUserId: respondentUserId,
              perspective: 'SELF',
            },
          },
          update: { deletedAt: null },
          create: {
            sessionId: dto.sessionId,
            respondentUserId,
            subjectUserId: respondentUserId,
            perspective: 'SELF',
          },
        }),
      ),
    );
    return { created: results.length };
  }

  async list(sessionId: number) {
    await this.ensureSession(sessionId);
    return this.prisma.assessmentAssignment.findMany({
      where: { sessionId, deletedAt: null },
      include: {
        respondent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNormalized: true,
          },
        },
        subject: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNormalized: true,
          },
        },
      },
    });
  }

  async update(id: number, dto: any) {
    const existing = await this.prisma.assessmentAssignment.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Assignment not found');
    if (dto.perspective) this.validatePerspective(dto.perspective); // validates
    return this.prisma.assessmentAssignment.update({
      where: { id },
      data: {
        perspective:
          (dto.perspective as ResponsePerspective) ?? existing.perspective,
        subjectUserId:
          dto.subjectUserId !== undefined
            ? dto.subjectUserId
            : existing.subjectUserId,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.assessmentAssignment.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Assignment not found');
    const updated = await this.prisma.assessmentAssignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id: updated.id };
  }
}
