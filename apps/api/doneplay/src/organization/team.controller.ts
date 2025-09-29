import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AddTeamDto } from './dto/add-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Roles } from '../common/roles.decorator';

@Controller('organizations/:orgId/teams')
export class TeamController {
  constructor(private service: TeamService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  create(@Param('orgId') orgId: string, @Body() dto: AddTeamDto) {
    return this.service.create(Number(orgId), dto);
  }

  @Get()
  list(
    @Param('orgId') orgId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.service.list(
      Number(orgId),
      Number(page) || 1,
      Number(pageSize) || 20,
      q,
      includeDeleted === 'true',
    );
  }

  @Get(':teamId')
  get(@Param('orgId') orgId: string, @Param('teamId') teamId: string) {
    return this.service.get(Number(orgId), Number(teamId));
  }

  @Patch(':teamId')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  update(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.service.update(Number(orgId), Number(teamId), dto);
  }

  @Delete(':teamId')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  remove(@Param('orgId') orgId: string, @Param('teamId') teamId: string) {
    return this.service.softDelete(Number(orgId), Number(teamId));
  }

  @Post(':teamId/restore')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  restore(@Param('orgId') orgId: string, @Param('teamId') teamId: string) {
    return this.service.restore(Number(orgId), Number(teamId));
  }
}
