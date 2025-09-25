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

@Controller('sessions')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.service.create(dto);
  }

  @Get()
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
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }

  // --- User-centric endpoints ---
  // List sessions assigned to a given user (for sidebar). Supports optional filters via query.
  @Get('user/:userId')
  listForUser(
    @Param('userId') userId: string,
    @Query() q: ListUserSessionsQueryDto,
  ) {
    return this.service.listForUser(Number(userId), q);
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
}
