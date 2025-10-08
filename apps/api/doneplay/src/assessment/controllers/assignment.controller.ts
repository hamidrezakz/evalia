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

@Controller('assignments')
@UseGuards(OrgContextGuard)
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  add(@Body() dto: AddAssignmentDto, @OrgId() orgId: number, @Req() _req: any) {
    // orgId validated by guard; session organization consistency validated indirectly via service.ensureSession
    return this.service.add(dto);
  }

  @Post('bulk')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  bulk(@Body() dto: BulkAssignDto, @OrgId() _orgId: number, @Req() _req: any) {
    return this.service.bulkAssign(dto);
  }

  @Get('session/:sessionId')
  @Roles({
    any: [
      'SUPER_ADMIN',
      'ANALYSIS_MANAGER',
      'ORG:OWNER',
      'ORG:MANAGER',
      'ORG:MEMBER', // allow members to view who is assigned
    ],
  })
  list(@Param('sessionId') sessionId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(sessionId));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @OrgId() _orgId: number,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  remove(@Param('id') id: string, @OrgId() _orgId: number) {
    return this.service.remove(Number(id));
  }
}
