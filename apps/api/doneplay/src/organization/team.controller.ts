import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AddTeamDto } from './dto/add-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { OrgContext } from '../common/org-context.decorator';
import { OrgContextGuard } from '../common/org-context.guard';

@Controller('organizations/:orgId/teams')
@UseGuards(OrgContextGuard)
@OrgContext({
  sources: { paramKey: 'orgId' },
  requireOrgRoles: ['OWNER', 'MANAGER'],
})
export class TeamController {
  constructor(private service: TeamService) {}

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: AddTeamDto) {
    const out = this.service.create(Number(orgId), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'تیم جدید ایجاد شد',
      data,
    }));
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
  update(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    const out = this.service.update(Number(orgId), Number(teamId), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'اطلاعات تیم بروزرسانی شد',
      data,
    }));
  }

  @Delete(':teamId')
  remove(@Param('orgId') orgId: string, @Param('teamId') teamId: string) {
    const out = this.service.softDelete(Number(orgId), Number(teamId));
    return Promise.resolve(out).then((data) => ({
      message: 'تیم حذف شد (قابل بازیابی)',
      data,
    }));
  }

  @Post(':teamId/restore')
  restore(@Param('orgId') orgId: string, @Param('teamId') teamId: string) {
    const out = this.service.restore(Number(orgId), Number(teamId));
    return Promise.resolve(out).then((data) => ({
      message: 'تیم بازیابی شد',
      data,
    }));
  }
}
