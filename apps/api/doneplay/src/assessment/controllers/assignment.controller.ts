import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';
import {
  AddAssignmentDto,
  BulkAssignDto,
  UpdateAssignmentDto,
} from '../dto/session.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';
import { OrgContext } from '../../common/org-context.decorator';

@Controller('assignments')
@UseGuards(OrgContextGuard)
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async add(
    @Body() dto: AddAssignmentDto,
    @OrgId() orgId: number,
    @Req() _req: any,
  ) {
    // orgId validated by guard; session organization consistency validated indirectly via service.ensureSession
    const created = await this.service.add(dto);
    return { data: created, message: 'تخصیص انجام شد' } as any;
  }

  @Post('bulk')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async bulk(
    @Body() dto: BulkAssignDto,
    @OrgId() _orgId: number,
    @Req() _req: any,
  ) {
    const res = await this.service.bulkAssign(dto);
    return { data: res, message: 'تخصیص‌ها ثبت شدند' } as any;
  }
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  @Get('session/:sessionId')
  @Roles({
    any: [
      'SUPER_ADMIN',
      'ANALYSIS_MANAGER',
      'ORG:OWNER',
      'ORG:MANAGER',
    ],
  })
  list(@Param('sessionId') sessionId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(sessionId));
  }
  
  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @OrgId() _orgId: number,
  ) {
    const updated = await this.service.update(Number(id), dto);
    return { data: updated, message: 'تخصیص بروزرسانی شد' } as any;
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async remove(@Param('id') id: string, @OrgId() _orgId: number) {
    const res = await this.service.remove(Number(id));
    return { data: res, message: 'تخصیص حذف شد' } as any;
  }
}
