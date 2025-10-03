import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import {
  CreateSessionDto,
  ListSessionQueryDto,
  UpdateSessionDto,
  ListUserSessionsQueryDto,
  UserQuestionsQueryDto,
} from '../dto/session.dto';
import { Roles } from '../../common/roles.decorator';
import { Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Controller('sessions')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post()
  @Roles({ any: ['ORG:OWNER', 'ORG:MANAGER', 'ANALYSIS_MANAGER'] })
  create(@Body() dto: CreateSessionDto) {
    return this.service.create(dto);
  }

  // Optional scoring service interface
  @Get()
  @Roles({
    any: ['ORG:OWNER', 'ORG:MANAGER', 'ANALYSIS_MANAGER', 'ORG:MEMBER'],
  })
  list(@Query() q: ListSessionQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Get(':id/full')
  full(@Param('id') id: string) {
    return this.service.getFull(Number(id));
  }

  // Minimal metadata: total number of questions in the session's template
  @Get(':id/question-count')
  getQuestionCount(@Param('id') id: string) {
    return this.service.getQuestionCount(Number(id));
  }

  @Patch(':id')
  @Roles({ any: ['ORG:OWNER', 'ORG:MANAGER', 'ANALYSIS_MANAGER'] })
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  // Only analysis manager can delete sessions (SUPER_ADMIN still bypasses via guard)
  @Roles({ any: ['ANALYSIS_MANAGER'] })
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }

  // --- User-centric endpoints ---
  // List sessions assigned to a given user (for sidebar). Supports optional filters via query.
  @Get('user/:userId')
  listForUser(
    @Param('userId') userId: string,
    @Query() q: ListUserSessionsQueryDto,
    @Req() req: Request,
  ) {
    const authUser: any = (req as any).user;
    const targetId = Number(userId);
    if (!Number.isFinite(targetId)) {
      throw new ForbiddenException('invalid user id');
    }
    if (!authUser) throw new ForbiddenException('unauthorized');
    // Support different JWT shapes (id | userId | sub)
    const authIdRaw = authUser.id ?? authUser.userId ?? authUser.sub;
    const authId = Number(authIdRaw);
    // If cannot parse auth id -> deny
    if (!Number.isFinite(authId)) throw new ForbiddenException('unauthorized');

    // Self access always allowed
    if (authId === targetId) {
      return this.service.listForUser(targetId, q);
    }

    const globalRoles: string[] = authUser.roles?.global || [];
    const orgMemberships: any[] = authUser.roles?.org || [];
    const hasOrgRole = (r: string) =>
      orgMemberships.some((m) =>
        m?.role ? m.role === r : Array.isArray(m?.roles) && m.roles.includes(r),
      );
    const privileged =
      globalRoles.includes('SUPER_ADMIN') ||
      globalRoles.includes('ANALYSIS_MANAGER') ||
      hasOrgRole('OWNER') ||
      hasOrgRole('MANAGER');

    if (!privileged) throw new ForbiddenException('دسترسی ندارید');

    return this.service.listForUser(targetId, q);
  }

  // List available perspectives for a user in a specific session
  @Get(':id/user/:userId/perspectives')
  listUserPerspectives(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.service.getUserPerspectives(Number(id), Number(userId));
  }

  // Get ordered questions (by section, then question order) for a user in a session for a chosen perspective
  @Get(':id/user/:userId/questions')
  getUserQuestions(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Query() q: UserQuestionsQueryDto,
  ) {
    return this.service.getQuestionsForUserPerspective(
      Number(id),
      Number(userId),
      q.perspective,
      q.subjectUserId,
    );
  }

  // AI export (concise) for user perspective
  @Get(':id/user/:userId/ai-export')
  getUserAiExport(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Query() q: UserQuestionsQueryDto,
  ) {
    return this.service.getAiExportForUserPerspective(
      Number(id),
      Number(userId),
      q.perspective,
      q.subjectUserId,
    );
  }
}
