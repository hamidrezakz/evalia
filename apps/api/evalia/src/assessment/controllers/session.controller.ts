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

  @Get(':id(\\d+)')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Get(':id(\\d+)/full')
  full(@Param('id') id: string) {
    return this.service.getFull(Number(id));
  }

  @Patch(':id(\\d+)')
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id(\\d+)')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }

  // --- User-centric endpoints ---
  // List sessions assigned to a given user (for sidebar). Supports optional filters via query.
  @Get('user/:userId(\\d+)')
  listForUser(
    @Param('userId') userId: string,
    @Query() q: ListUserSessionsQueryDto,
  ) {
    return this.service.listForUser(Number(userId), q);
  }

  // List available perspectives for a user in a specific session
  @Get(':id(\\d+)/user/:userId(\\d+)/perspectives')
  listUserPerspectives(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.getUserPerspectives(Number(id), Number(userId));
  }

  // Get ordered questions (by section, then question order) for a user in a session for a chosen perspective
  @Get(':id(\\d+)/user/:userId(\\d+)/questions')
  getUserQuestions(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Query() q: UserQuestionsQueryDto,
  ) {
    return this.service.getQuestionsForUserPerspective(
      Number(id),
      Number(userId),
      q.perspective,
    );
  }
}
