import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OptionSetService } from '../services/option-set.service';
import { CreateOptionSetDto, UpdateOptionSetDto } from '../dto/option-set.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';
import { OrgContext } from '../../common/org-context.decorator';

@Controller('option-sets')
@UseGuards(OrgContextGuard)
export class OptionSetController {
  constructor(private readonly service: OptionSetService) {}

  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  @Post()
  async create(
    @Body() dto: CreateOptionSetDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    const created = await this.service.create(dto, orgId, userId);
    return { data: created, message: 'مجموعه گزینه ایجاد شد' } as any;
  }

  @Get()
  list(@OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.list({}, orgId, userId);
  }

  @Get(':id')
  get(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.getById(Number(id), orgId, userId);
  }

  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOptionSetDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    const updated = await this.service.update(Number(id), dto, orgId, userId);
    return { data: updated, message: 'مجموعه گزینه بروزرسانی شد' } as any;
  }

  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    const res = await this.service.softDelete(Number(id), orgId, userId);
    return { data: res, message: 'مجموعه گزینه حذف شد' } as any;
  }
}
