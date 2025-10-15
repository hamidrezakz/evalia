import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { TemplateQuestionService } from '../services/template-question.service';
import {
  AddTemplateQuestionDto,
  BulkSetSectionQuestionsDto,
  UpdateTemplateQuestionDto,
} from '../dto/template.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';
import {
  TemplateAccessGuard,
  TemplateAccess,
} from '../guards/template-access.guard';
import { OrgContext } from '../../common/org-context.decorator';

@Controller('template-questions')
@UseGuards(OrgContextGuard, TemplateAccessGuard)
export class TemplateQuestionController {
  constructor(private readonly service: TemplateQuestionService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess(['EDIT', 'ADMIN'])
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async add(@Body() dto: AddTemplateQuestionDto, @OrgId() _orgId: number) {
    const created = await this.service.add(dto);
    return { data: created, message: 'سوال به الگو اضافه شد' } as any;
  }

  @Get(':sectionId')
  @TemplateAccess('USE')
  list(@Param('sectionId') sectionId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(sectionId));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess(['EDIT', 'ADMIN'])
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateQuestionDto,
    @OrgId() _orgId: number,
  ) {
    const updated = await this.service.update(Number(id), dto);
    return { data: updated, message: 'سوال الگو بروزرسانی شد' } as any;
  }

  @Post(':sectionId/bulk-set')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess(['EDIT', 'ADMIN'])
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async bulk(
    @Param('sectionId') sectionId: string,
    @Body() dto: BulkSetSectionQuestionsDto,
    @OrgId() _orgId: number,
  ) {
    const res = await this.service.bulkSet(Number(sectionId), dto.items);
    return { data: res, message: 'سوال‌های بخش تنظیم شدند' } as any;
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess(['EDIT', 'ADMIN'])
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async remove(@Param('id') id: string, @OrgId() _orgId: number) {
    const res = await this.service.remove(Number(id));
    return { data: res, message: 'سوال الگو حذف شد' } as any;
  }

  @Put(':id/restore')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess(['EDIT', 'ADMIN'])
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async restore(@Param('id') id: string, @OrgId() _orgId: number) {
    const res = await this.service.restore(Number(id));
    return { data: res, message: 'سوال الگو بازیابی شد' } as any;
  }
}
