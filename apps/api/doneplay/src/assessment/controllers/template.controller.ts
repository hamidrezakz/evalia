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
import { TemplateService } from '../services/template.service';
import {
  CreateTemplateDto,
  ListTemplateQueryDto,
  UpdateTemplateDto,
} from '../dto/template.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';
import {
  TemplateAccessGuard,
  TemplateAccess,
} from '../guards/template-access.guard';
import { OrgContext } from '../../common/org-context.decorator';

@Controller('templates')
@UseGuards(OrgContextGuard, TemplateAccessGuard)
export class TemplateController {
  constructor(private readonly service: TemplateService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async create(
    @Body() dto: CreateTemplateDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    const created = await this.service.create(dto, orgId, userId);
    return { data: created, message: 'الگو ایجاد شد' } as any;
  }

  @Get()
  list(@Req() req: any, @OrgId() orgId: number) {
    const userId = req?.user?.userId;
    // NOTE: previously supported search/state via query; could reintroduce DTO and pick values
    return this.service.list({}, orgId, userId);
  }

  @Get(':id')
  @Roles({
    any: [
      'SUPER_ADMIN',
      'ANALYSIS_MANAGER',
      'ORG:OWNER',
      'ORG:MANAGER',
      // Allow basic members to view template metadata
      'ORG:MEMBER',
    ],
  })
  @TemplateAccess('USE')
  get(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.getById(Number(id), orgId, userId);
  }

  @Get(':id/full')
  @Roles({
    any: [
      'SUPER_ADMIN',
      'ANALYSIS_MANAGER',
      'ORG:OWNER',
      'ORG:MANAGER',
      // Allow members to fetch full structure for answering
      'ORG:MEMBER',
    ],
  })
  @TemplateAccess('USE')
  full(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.getFull(Number(id), orgId, userId);
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess('EDIT')
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    const updated = await this.service.update(Number(id), dto, orgId, userId);
    return { data: updated, message: 'الگو بروزرسانی شد' } as any;
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @TemplateAccess('ADMIN')
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async remove(
    @Param('id') id: string,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    const res = await this.service.softDelete(Number(id), orgId, userId);
    return { data: res, message: 'الگو حذف شد' } as any;
  }
}
