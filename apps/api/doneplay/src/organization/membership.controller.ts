import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrgRole } from '@prisma/client';
import { OrgContext } from '../common/org-context.decorator';
import { OrgContextGuard } from '../common/org-context.guard';

@Controller('organizations/:orgId/members')
@UseGuards(OrgContextGuard)
@OrgContext({
  sources: { paramKey: 'orgId' },
  requireOrgRoles: ['OWNER', 'MANAGER'],
})
export class MembershipController {
  constructor(private service: MembershipService) {}

  @Get()
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
  add(@Param('orgId') orgId: string, @Body() dto: AddMemberDto) {
    const out = this.service.add(Number(orgId), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'عضو جدید به سازمان اضافه شد',
      data,
    }));
  }

  @Patch(':membershipId')
  update(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const out = this.service.update(Number(orgId), Number(membershipId), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'نقش عضو سازمان بروزرسانی شد',
      data,
    }));
  }

  @Delete(':membershipId')
  remove(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
  ) {
    const out = this.service.remove(Number(orgId), Number(membershipId));
    return Promise.resolve(out).then((data) => ({
      message: 'عضویت کاربر از سازمان حذف شد',
      data,
    }));
  }
}
