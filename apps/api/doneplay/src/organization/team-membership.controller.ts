import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TeamMembershipService } from './team-membership.service';
import { OrgContext } from '../common/org-context.decorator';
import { OrgContextGuard } from '../common/org-context.guard';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class AddTeamMemberDto {
  @Type(() => Number)
  @IsInt()
  userId!: number;
}

@Controller('organizations/:orgId/teams/:teamId/members')
@UseGuards(OrgContextGuard)
@OrgContext({
  sources: { paramKey: 'orgId' },
  requireOrgRoles: ['OWNER', 'MANAGER'],
})
export class TeamMembershipController {
  constructor(private service: TeamMembershipService) {}

  @Get()
  list(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.list(
      Number(orgId),
      Number(teamId),
      Number(page) || 1,
      Number(pageSize) || 20,
    );
  }

  @Post()
  add(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
  ) {
    const out = this.service.add(Number(orgId), Number(teamId), dto.userId);
    return Promise.resolve(out).then((data) => ({
      message: 'عضو جدید به تیم اضافه شد',
      data,
    }));
  }

  @Delete(':membershipId')
  remove(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Param('membershipId') membershipId: string,
  ) {
    const out = this.service.remove(
      Number(orgId),
      Number(teamId),
      Number(membershipId),
    );
    return Promise.resolve(out).then((data) => ({
      message: 'عضویت کاربر از تیم حذف شد',
      data,
    }));
  }
}
