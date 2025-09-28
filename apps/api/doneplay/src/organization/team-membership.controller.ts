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

class AddTeamMemberDto {
  userId!: number;
}

@Controller('organizations/:orgId/teams/:teamId/members')
export class TeamMembershipController {
  constructor(private service: TeamMembershipService) {}

  @Get()
  @Roles('ORG:OWNER', 'ORG:MANAGER')
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
  @Roles('ORG:OWNER', 'ORG:MANAGER')
  add(
    @Param('orgId') orgId: string,
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.service.add(Number(orgId), Number(teamId), dto.userId);
  }

  @Delete(':membershipId')
  @Roles('ORG:OWNER', 'ORG:MANAGER')
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
