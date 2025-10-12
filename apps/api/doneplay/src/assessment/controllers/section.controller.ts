import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SectionService } from '../services/section.service';
import {
  CreateSectionDto,
  ReorderSectionsDto,
  UpdateSectionDto,
} from '../dto/template.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';
import {
  TemplateAccessGuard,
  TemplateAccess,
} from '../guards/template-access.guard';
import { OrgContext } from '../../common/org-context.decorator';

@Controller('template-sections')
@UseGuards(OrgContextGuard, TemplateAccessGuard)
export class SectionController {
  constructor(private readonly service: SectionService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess('EDIT')
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async create(@Body() dto: CreateSectionDto, @OrgId() _orgId: number) {
    const created = await this.service.create(dto);
    return { data: created, message: 'بخش ایجاد شد' } as any;
  }

  @Get(':templateId')
  @TemplateAccess('USE')
  list(@Param('templateId') templateId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(templateId));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess('EDIT')
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @OrgId() _orgId: number,
  ) {
    const updated = await this.service.update(Number(id), dto);
    return { data: updated, message: 'بخش بروزرسانی شد' } as any;
  }

  @Post(':templateId/reorder')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess('EDIT')
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async reorder(
    @Param('templateId') templateId: string,
    @Body() dto: ReorderSectionsDto,
    @OrgId() _orgId: number,
  ) {
    const res = await this.service.reorder(Number(templateId), dto.sectionIds);
    return { data: res, message: 'ترتیب بخش‌ها بروزرسانی شد' } as any;
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess('EDIT')
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async remove(@Param('id') id: string, @OrgId() _orgId: number) {
    const res = await this.service.softDelete(Number(id));
    return { data: res, message: 'بخش حذف شد' } as any;
  }
}
