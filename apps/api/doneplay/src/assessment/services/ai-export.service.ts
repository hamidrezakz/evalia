import { Injectable } from '@nestjs/common';
import { ResponsePerspective } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { getTemplateAnalyses } from '../analysis';

/**
 * AiExportService
 * --------------------------------------
 * Builds the concise AI-friendly export payload for an assessment session + user perspective.
 * Responsibilities:
 *  - Fetch ordered questions + responses via SessionService helper.
 *  - Normalize answers (single, multi, scale, text) and derive numeric where possible.
 *  - Provide unified option set (first encountered question's options or optionSet).
 *  - Collect template meta (exposed as templateMeta) for downstream AI usage.
 *  - Run any registered analyses (e.g. Glasser) and append results under `analyses`.
 *
 * Glasser Detection Logic (current):
 *  A Glasser analysis service declares supports(template) returning true if:
 *    1) template.meta.glasserScoring exists (automatic meta-based activation), OR
 *    2) template.id is listed inside GlasserAnalysisService.TEMPLATE_IDS (manual binding).
 *  Thus right now we rely on meta first; id list is empty unless populated manually.
 */
@Injectable()
export class AiExportService {
  constructor(private readonly prisma: PrismaService) {}

  async build(
    sessionId: number,
    userId: number,
    perspective: ResponsePerspective,
    subjectUserId?: number,
  ) {
    // Step 1: Resolve assignment & pull ordered template questions similar to SessionService logic (to avoid circular dep)
    // Validate assignment exists for this user/perspective
    const assignmentWhere: any = {
      sessionId,
      respondentUserId: userId,
      perspective,
    };
    if (perspective !== 'SELF') {
      if (!subjectUserId)
        throw new Error('subjectUserId required for non-SELF perspective');
      assignmentWhere.subjectUserId = subjectUserId;
    } else if (!subjectUserId) {
      assignmentWhere.OR = [{ subjectUserId: null }, { subjectUserId: userId }];
    } else {
      assignmentWhere.subjectUserId = subjectUserId;
    }

    const assignment = await this.prisma.assessmentAssignment.findFirst({
      where: assignmentWhere,
    });
    if (!assignment) throw new Error('Assignment not found for AI export');

    const session = await this.prisma.assessmentSession.findUnique({
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
    if (!session) throw new Error('Session not found');

    const sections = (session.template?.sections || []).map((sec) => {
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

    const data = {
      session: { id: session.id, name: session.name, state: session.state },
      assignment: { id: assignment.id, perspective: assignment.perspective },
      sections,
      responses,
    };

    // Step 2: Pull template (id/slug/meta) separately to avoid over-fetch duplication
    const tpl = session.template;

    // Flatten questions
    const flattened = data.sections.flatMap((s) => s.questions);

    // Index responses by templateQuestionId
    const respByTQ: Record<number, any> = {};
    for (const r of data.responses || []) respByTQ[r.templateQuestionId] = r;

    // Step 3: Determine unified option set (first question that has options/optionSet)
    let unified: { value: string; numeric: number }[] | undefined;
    for (const q of flattened) {
      const opts = q.question?.optionSet?.options || q.question?.options;
      if (opts?.length) {
        unified = opts.map((o) => {
          const numLabel = Number(o.label);
          const numeric = Number.isFinite(numLabel)
            ? numLabel
            : (o.order ?? 0) + 1;
          return { value: o.value, numeric };
        });
        break;
      }
    }

    // Step 4: Build normalized question views
    const questions = flattened.map((q, idx) => {
      const resp = respByTQ[q.templateQuestionId];
      let answer: string | null = null;
      let numeric: number | null = null;
      const answerType: string = q.question.type;
      let multiAnswers: string[] | null = null;
      let multiSelectedDetailed:
        | { value: string; numeric?: number | null }[]
        | null = null;

      if (resp) {
        if (resp.scaleValue != null) {
          answer = String(resp.scaleValue);
          numeric = resp.scaleValue;
        } else if (resp.optionValue != null) {
          answer = resp.optionValue;
        }
        if (
          resp.optionValues &&
          Array.isArray(resp.optionValues) &&
          resp.optionValues.length
        ) {
          multiAnswers = resp.optionValues;
          answer = (multiAnswers || []).join(', ');
        }
        if (resp.textValue != null && resp.textValue !== '') {
          answer = resp.textValue;
        }
      }

      const optionSource = q.question.optionSet?.options || q.question.options;
      if (
        numeric == null &&
        answer &&
        optionSource &&
        answerType === 'SINGLE_CHOICE'
      ) {
        const match = optionSource.find((o: any) => o.value === answer);
        if (match) {
          const asNum = Number(match.label);
          numeric = Number.isFinite(asNum) ? asNum : (match.order ?? 0) + 1;
        }
      }

      if (answerType === 'MULTI_CHOICE' && multiAnswers && optionSource) {
        multiSelectedDetailed = multiAnswers.map((val) => {
          const m = optionSource.find((o: any) => o.value === val);
          if (!m) return { value: val, numeric: undefined };
          const asNum = Number(m.label);
          return {
            value: val,
            numeric: Number.isFinite(asNum) ? asNum : (m.order ?? 0) + 1,
          };
        });
      }

      return {
        number: idx + 1,
        templateQuestionId: q.templateQuestionId,
        text: q.question.text,
        type: answerType,
        answer,
        answers: multiAnswers,
        selected: multiSelectedDetailed || undefined,
        numeric: numeric ?? null,
        required: q.required,
        scaleRange:
          answerType === 'SCALE'
            ? { min: q.question.minScale, max: q.question.maxScale }
            : undefined,
      };
    });

    const answered = questions.filter((q) => q.answer != null).length;

    // Step 5: Run registered analyses (includes Glasser if supports())
    const analyses: Record<string, any> = {};
    if (tpl) {
      const services = getTemplateAnalyses(tpl);
      for (const svc of services) {
        try {
          analyses[svc.key] = svc.analyze({
            template: tpl,
            questions: questions.map((q) => ({
              number: q.number,
              numeric: q.numeric,
              answer: q.answer,
              type: q.type,
            })),
            answered,
            total: questions.length,
          });
        } catch (e) {
          analyses[svc.key] = {
            error: 'analysis_failed',
            message: (e as any)?.message,
          };
        }
      }
    }

    // Step 6: Assemble export object
    return {
      template: tpl
        ? {
            id: tpl.id,
            slug: tpl.slug,
            name: tpl.name,
            templateMeta: tpl.meta || {},
          }
        : undefined,
      meta: {
        generatedAt: new Date().toISOString(),
        sessionId: data.session.id,
        sessionName: data.session.name,
        perspective: data.assignment.perspective,
        assignmentId: data.assignment.id,
        totalQuestions: questions.length,
        answered,
        unanswered: questions.length - answered,
        optionSet: unified ? { values: unified } : undefined,
      },
      questions,
      analyses: Object.keys(analyses).length ? analyses : undefined,
    };
  }
}
