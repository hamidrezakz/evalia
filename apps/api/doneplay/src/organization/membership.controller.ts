import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrgRole } from '@prisma/client';
import { Roles } from '../common/roles.decorator';

@Controller('organizations/:orgId/members')
export class MembershipController {
  constructor(private service: MembershipService) {}

  @Get()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  list(
    @Param('orgId') orgId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('role') role?: OrgRole,
    @Query('q') q?: string,
  ) {
    return this.service.list(
      Number(orgId),
      Number(page) || 1,
      Number(pageSize) || 20,
      role,
      q,
    );
  }

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  add(@Param('orgId') orgId: string, @Body() dto: AddMemberDto) {
    return this.service.add(Number(orgId), dto);
  }

  @Patch(':membershipId')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  update(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.service.update(Number(orgId), Number(membershipId), dto);
  }

  @Delete(':membershipId')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  remove(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.service.remove(Number(orgId), Number(membershipId));
  }
}
