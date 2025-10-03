import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponsePerspective } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { AiExportService } from './ai-export.service';

const SESSION_STATE_FLOW: Record<string, string[]> = {
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ANALYZING', 'COMPLETED', 'CANCELLED'],
  ANALYZING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiExport: AiExportService,
  ) {}

  private async ensureTemplate(id: number) {
    const tpl = await this.prisma.assessmentTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!tpl) throw new BadRequestException('Invalid templateId');
    if (tpl.state !== 'ACTIVE')
      throw new BadRequestException('Template must be ACTIVE');
    return tpl;
  }

  private async ensureOrg(id: number) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
    });
    if (!org) throw new BadRequestException('Invalid organizationId');
    return org;
  }

  private async ensureTeam(id?: number | null) {
    if (!id) return null;
    const team = await this.prisma.team.findFirst({
      where: { id, deletedAt: null },
    });
    if (!team) throw new BadRequestException('Invalid teamScopeId');
    return team;
  }

  async create(dto: any) {
    await this.ensureOrg(dto.organizationId);
    await this.ensureTemplate(dto.templateId);
    await this.ensureTeam(dto.teamScopeId);
    if (new Date(dto.endAt) <= new Date(dto.startAt))
      throw new BadRequestException('endAt must be after startAt');
    return this.prisma.assessmentSession.create({
      data: {
        organizationId: dto.organizationId,
        templateId: dto.templateId,
        teamScopeId: dto.teamScopeId ?? null,
        name: dto.name,
        description: dto.description || null,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        // Optional scoring service interface
        meta: dto.meta || {},
      },
    });
  }

  async list(query: any) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const where: any = { deletedAt: null };
    if (query.organizationId)
      where.organizationId = Number(query.organizationId);
    if (query.templateId) where.templateId = Number(query.templateId);
    if (query.state) where.state = query.state;
    if (query.search)
      where.name = { contains: query.search, mode: 'insensitive' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.assessmentSession.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { startAt: 'desc' },
      }),
      this.prisma.assessmentSession.count({ where }),
    ]);
    return { data: items, meta: { page, pageSize, total } };
  }

  async getById(id: number) {
    const s = await this.prisma.assessmentSession.findFirst({
      where: { id, deletedAt: null },
    });
    if (!s) throw new NotFoundException('Session not found');
    return s;
  }

  async getFull(id: number) {
    await this.getById(id);
    return this.prisma.assessmentSession.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            sections: {
              include: {
                questions: {
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
            },
          },
        },
        assignments: {
          include: {
            respondent: { select: { id: true, fullName: true } },
            subject: { select: { id: true, fullName: true } },
          },
        },
      },
    });
  }

  // Return only the total number of questions for a session's template
  async getQuestionCount(id: number) {
    const s = await this.getById(id);
    // Count questions across sections for the template without loading full nested graph
    const sections = await this.prisma.assessmentTemplateSection.findMany({
      where: { templateId: s.templateId },
      select: { id: true },
    });
    if (!sections.length)
      return { sessionId: s.id, templateId: s.templateId, total: 0 };
    const sectionIds = sections.map((sec) => sec.id);
    // Each section has many 'assessmentTemplateQuestion' links; count directly
    const total = await this.prisma.assessmentTemplateQuestion.count({
      where: { sectionId: { in: sectionIds } },
    });
    return { sessionId: s.id, templateId: s.templateId, total };
  }

  async update(id: number, dto: any) {
    const existing = await this.getById(id);
    if (
      dto.startAt &&
      dto.endAt &&
      new Date(dto.endAt) <= new Date(dto.startAt)
    ) {
      throw new BadRequestException('endAt must be after startAt');
    }
    if (dto.state && dto.state !== existing.state) {
      const allowed = SESSION_STATE_FLOW[existing.state] || [];
      const force = Boolean(dto.force);
      if (!force && !allowed.includes(dto.state)) {
        throw new BadRequestException(
          `Illegal state transition ${existing.state} -> ${dto.state}`,
        );
      }
    }
    return this.prisma.assessmentSession.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        description:
          dto.description !== undefined
            ? dto.description
            : existing.description,
        state: dto.state ?? existing.state,
        startAt: dto.startAt ? new Date(dto.startAt) : existing.startAt,
        endAt: dto.endAt ? new Date(dto.endAt) : existing.endAt,
        teamScopeId:
          dto.teamScopeId !== undefined
            ? dto.teamScopeId
            : existing.teamScopeId,
        meta: dto.meta !== undefined ? dto.meta : existing.meta,
      },
    });
  }

  async softDelete(id: number) {
    await this.getById(id);
    return this.prisma.assessmentSession.update({
      where: { id },
      data: { deletedAt: new Date(), state: 'CANCELLED' },
    });
  }

  // --- User-centric helpers ---
  // List sessions assigned to a specific user (with optional filters and pagination)
  async listForUser(
    userId: number,
    query: {
      state?: string;
      organizationId?: number;
      page?: number;
      pageSize?: number;
      search?: string;
    },
  ) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const whereSession: any = { deletedAt: null };
    if (query.organizationId)
      whereSession.organizationId = Number(query.organizationId);
    if (query.state) whereSession.state = query.state;
    if (query.search)
      whereSession.name = { contains: query.search, mode: 'insensitive' };

    // Join via assignments for the given user
    const [items, total] = await this.prisma.$transaction([
      this.prisma.assessmentSession.findMany({
        where: {
          ...whereSession,
          assignments: { some: { respondentUserId: userId } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { startAt: 'desc' },
        include: {
          assignments: {
            where: { respondentUserId: userId },
            select: { perspective: true, createdAt: true },
          },
        },
      }),
      this.prisma.assessmentSession.count({
        where: {
          ...whereSession,
          assignments: { some: { respondentUserId: userId } },
        },
      }),
    ]);

    // Map to minimal payload including available perspectives for user in that session
    const data = items.map((s) => {
      const assignments: any[] = (s as any).assignments || [];
      // Find earliest createdAt among this user's assignments as assignedAt
      let assignedAt: Date | null = null;
      for (const a of assignments) {
        if (a?.createdAt) {
          if (!assignedAt || a.createdAt < assignedAt) assignedAt = a.createdAt;
        }
      }
      return {
        id: s.id,
        name: s.name,
        state: s.state,
        organizationId: s.organizationId,
        templateId: s.templateId,
        startAt: s.startAt,
        endAt: s.endAt,
        assignedAt: assignedAt,
        perspectives: Array.from(
          new Set(assignments.map((a: any) => a.perspective)),
        ),
      };
    });

    return { data, meta: { page, pageSize, total } };
  }

  // Return all perspectives available to a user for a session (based on assignments)
  async getUserPerspectives(sessionId: number, userId: number) {
    // Ensure session exists
    await this.getById(sessionId);
    const assigns = await this.prisma.assessmentAssignment.findMany({
      where: { sessionId, respondentUserId: userId },
      select: { perspective: true },
    });
    const perspectives = Array.from(new Set(assigns.map((a) => a.perspective)));
    return { sessionId, userId, perspectives };
  }

  // Fetch questions for a user in a session for the chosen perspective, ordered by section and question order
  async getQuestionsForUserPerspective(
    sessionId: number,
    userId: number,
    perspective: ResponsePerspective,
    subjectUserId?: number,
  ) {
    // Verify there's an assignment for this user/perspective
    // For non-SELF perspectives, subjectUserId is required
    if (perspective !== 'SELF' && !subjectUserId) {
      throw new BadRequestException('subjectUserId required for non-SELF');
    }
    const whereAssignment: any = {
      sessionId,
      respondentUserId: userId,
      perspective,
    };
    if (subjectUserId) whereAssignment.subjectUserId = subjectUserId;
    // For SELF, support either explicit subject match or classic SELF rows (subject=null or = respondent depending on migration phase)
    if (perspective === 'SELF' && !subjectUserId) {
      whereAssignment.OR = [{ subjectUserId: null }, { subjectUserId: userId }];
    }
    const assignment = await this.prisma.assessmentAssignment.findFirst({
      where: whereAssignment,
    });
    if (!assignment)
      throw new NotFoundException('No assignment for this user/perspective');

    const full = await this.prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        template: {
          include: {
            sections: {
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
            },
          },
        },
      },
    });
    if (!full) throw new NotFoundException('Session not found');

    // Filter sections/questions by template question perspectives if defined
    const sections = (full.template.sections || []).map((sec) => {
      const qs = sec.questions
        .filter((link) =>
          !link.perspectives || link.perspectives.length === 0
            ? true
            : link.perspectives.includes(perspective as any),
        )
        .map((link) => ({
          templateQuestionId: link.id,
          questionId: link.questionId,
          required: link.required,
          order: link.order,
          question: link.question,
        }));
      return {
        id: sec.id,
        title: sec.title,
        order: sec.order,
        questions: qs,
      };
    });

    // Fetch existing responses for this assignment limited to these templateQuestionIds
    const templateQuestionIds = sections.flatMap((s) =>
      s.questions.map((q) => q.templateQuestionId),
    );
    const responses = await this.prisma.assessmentResponse.findMany({
      where: {
        sessionId,
        assignmentId: assignment.id,
        templateQuestionId: { in: templateQuestionIds },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      session: { id: full.id, name: full.name, state: full.state },
      assignment: { id: assignment.id, perspective: assignment.perspective },
      sections,
      responses,
    };
  }

  // Build AI-friendly export (concise questions + answers + unified option set)
  async getAiExportForUserPerspective(
    sessionId: number,
    userId: number,
    perspective: ResponsePerspective,
    subjectUserId?: number,
  ) {
    return this.aiExport.build(sessionId, userId, perspective, subjectUserId);
  }
}
