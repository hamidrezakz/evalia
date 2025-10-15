import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { TemplateAccessLevel } from '@prisma/client';

// Metadata key to define required access level on a handler
export const TEMPLATE_ACCESS_KEY = 'template_access_level';

export const TemplateAccess =
  (level: TemplateAccessLevel | TemplateAccessLevel[]) =>
  (target: any, key?: any, descriptor?: any) => {
    Reflect.defineMetadata(TEMPLATE_ACCESS_KEY, level, descriptor.value);
    return descriptor;
  };

@Injectable()
export class TemplateAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  private levelRank(level?: TemplateAccessLevel | null): number {
    switch (level) {
      case 'USE':
      case 'CLONE':
        return 1;
      case 'EDIT':
        return 2;
      case 'ADMIN':
        return 3;
      default:
        return 0;
    }
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const requiredRaw: TemplateAccessLevel | TemplateAccessLevel[] | undefined =
      this.reflector.get<TemplateAccessLevel | TemplateAccessLevel[]>(
        TEMPLATE_ACCESS_KEY,
        ctx.getHandler(),
      );
    // If no specific requirement, allow (OrgContextGuard already validated org membership)
    if (!requiredRaw) return true;
    const requiredLevels: TemplateAccessLevel[] = Array.isArray(requiredRaw)
      ? requiredRaw
      : [requiredRaw];

    // Try to resolve templateId directly, otherwise via section/question identifiers
    let templateId: number | undefined;
    const directTemplateIdParam = req.params?.templateId;
    if (directTemplateIdParam && !Number.isNaN(Number(directTemplateIdParam))) {
      templateId = Number(directTemplateIdParam);
    }

    // If handler param named id might be a template id ONLY when invoked inside TemplateController.
    // For Section / TemplateQuestion controllers the :id refers to sectionId or templateQuestionId.
    const controllerName = ctx.getClass().name;
    if (
      !templateId &&
      controllerName === 'TemplateController' &&
      req.params?.id &&
      !Number.isNaN(Number(req.params.id))
    ) {
      templateId = Number(req.params.id);
    }

    // When inside SectionController, the ":id" param refers to a section id; resolve its templateId
    if (
      !templateId &&
      controllerName === 'SectionController' &&
      req.params?.id &&
      !Number.isNaN(Number(req.params.id))
    ) {
      const sectionIdNum = Number(req.params.id);
      const section = await this.prisma.assessmentTemplateSection.findFirst({
        where: { id: sectionIdNum, deletedAt: null },
        select: { templateId: true },
      });
      if (section) templateId = section.templateId;
    }

    // If still missing, attempt resolution from sectionId (template-question list/bulk) or section id in path
    if (!templateId && req.params?.sectionId) {
      const sectionIdNum = Number(req.params.sectionId);
      if (!Number.isNaN(sectionIdNum)) {
        const section = await this.prisma.assessmentTemplateSection.findFirst({
          where: { id: sectionIdNum, deletedAt: null },
          select: { templateId: true },
        });
        if (section) templateId = section.templateId;
      }
    }

    // If still missing, try resolving from body (e.g., creating a section requires templateId in body)
    if (!templateId && req.body && typeof req.body === 'object') {
      const possible = (req.body as any).templateId;
      if (!Number.isNaN(Number(possible))) {
        templateId = Number(possible);
      }
      // Also handle cases where body carries a sectionId (e.g., POST /template-questions)
      if (!templateId) {
        const bodySectionId = Number((req.body as any).sectionId);
        if (!Number.isNaN(bodySectionId)) {
          const section = await this.prisma.assessmentTemplateSection.findFirst(
            {
              where: { id: bodySectionId, deletedAt: null },
              select: { templateId: true },
            },
          );
          if (section) templateId = section.templateId;
        }
      }
    }

    // If still missing, attempt resolution from template-question id (update/remove) when in TemplateQuestionController
    if (
      !templateId &&
      controllerName === 'TemplateQuestionController' &&
      req.params?.id
    ) {
      const tqId = Number(req.params.id);
      if (!Number.isNaN(tqId)) {
        const tq = await this.prisma.assessmentTemplateQuestion.findUnique({
          where: { id: tqId },
          select: { section: { select: { templateId: true } } },
        });
        if (tq?.section) templateId = tq.section.templateId;
      }
    }

    if (
      !templateId &&
      controllerName === 'TemplateQuestionController' &&
      req.params?.id
    ) {
      // Fallback: maybe :id is actually a sectionId mistakenly used
      const possibleSectionId = Number(req.params.id);
      if (!Number.isNaN(possibleSectionId)) {
        const section = await this.prisma.assessmentTemplateSection.findFirst({
          where: { id: possibleSectionId, deletedAt: null },
          select: { templateId: true },
        });
        if (section) templateId = section.templateId;
      }
    }

    // Generic final fallback: if still unresolved and there's an :id, try treating it as a section id
    if (!templateId && req.params?.id && !Number.isNaN(Number(req.params.id))) {
      const possibleSectionId = Number(req.params.id);
      const section = await this.prisma.assessmentTemplateSection.findFirst({
        where: { id: possibleSectionId, deletedAt: null },
        select: { templateId: true },
      });
      if (section) templateId = section.templateId;
    }

    if (!templateId) {
      throw new BadRequestException(
        'Unable to resolve template id (ensure you are sending template-question link id, not raw questionId or sectionId)',
      );
    }
    const orgId: number | undefined = req.orgId;
    if (!orgId) {
      throw new BadRequestException('orgId missing in request context');
    }

    // Privileged role bypasses:
    // - SUPER_ADMIN: always allowed
    // - ANALYSIS_MANAGER: allow all template operations within an org context
    // - ORG:OWNER / ORG:MANAGER within the same org: treat as EDIT for template-scoped operations
    const user = req.user as any;
    const roles = (user?.roles || { global: [], org: [] }) as any;
    const hasGlobal = (r: string) =>
      Array.isArray(roles.global) && roles.global.includes(r);
    const hasOrgRole = (r: string) => {
      const orgMemberships: any[] = Array.isArray(roles.org) ? roles.org : [];
      return orgMemberships.some((m) => {
        const oid = Number(
          m?.orgId ?? m?.organizationId ?? m?.org?.id ?? m?.organization?.id,
        );
        if (!Number.isFinite(oid) || oid !== orgId) return false;
        const rlist: string[] = Array.isArray(m?.roles)
          ? m.roles
          : m?.role
            ? [m.role]
            : [];
        return rlist.includes(r);
      });
    };
    if (hasGlobal('SUPER_ADMIN')) return true;
    if (hasGlobal('ANALYSIS_MANAGER')) return true;

    // Load template with link access level for this org
    const tpl = await this.prisma.assessmentTemplate.findFirst({
      where: { id: templateId, deletedAt: null },
      include: {
        orgLinks: {
          where: { organizationId: orgId },
          select: { accessLevel: true },
        },
      },
    });
    if (!tpl) throw new NotFoundException('Template not found');

    // If organization created it, treat as ADMIN automatically
    if (tpl.createdByOrganizationId === orgId) return true;

    // NOTE: Do NOT implicitly elevate ORG:OWNER / ORG:MANAGER for EDIT operations.
    // Access to mutate templates/sections/questions must come from the template link access level
    // (or createdByOrganizationId shortcut above) to ensure USE-only orgs cannot modify.

    const link = tpl.orgLinks[0];
    if (!link)
      throw new ForbiddenException('Template not linked to organization');
    // Allow if link access meets ANY of the required levels
    const ok = requiredLevels.some(
      (rl) => this.levelRank(link.accessLevel) >= this.levelRank(rl),
    );
    if (!ok) {
      throw new ForbiddenException('Insufficient template access level');
    }
    return true;
  }
}
