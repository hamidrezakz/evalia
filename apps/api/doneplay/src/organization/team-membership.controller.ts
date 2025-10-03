import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { TeamMembershipService } from './team-membership.service';
import { Roles } from '../common/roles.decorator';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class AddTeamMemberDto {
  @Type(() => Number)
  @IsInt()
  userId!: number;
}

@Controller('organizations/:orgId/teams/:teamId/members')
export class TeamMembershipController {
  constructor(private service: TeamMembershipService) {}

  @Get()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
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
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  add(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.service.add(Number(orgId), Number(teamId), dto.userId);
  }

  @Delete(':membershipId')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  remove(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.service.remove(
      Number(orgId),
      Number(teamId),
      Number(membershipId),
    );
  }
}
