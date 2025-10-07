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

@Controller('templates')
@UseGuards(OrgContextGuard)
export class TemplateController {
  constructor(private readonly service: TemplateService) {}

  @Post()
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  create(
    @Body() dto: CreateTemplateDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    return this.service.create(dto, orgId, userId);
  }

  @Get()
  list(@Req() req: any, @OrgId() orgId: number) {
    const userId = req?.user?.userId;
    // NOTE: previously supported search/state via query; could reintroduce DTO and pick values
    return this.service.list({}, orgId, userId);
  }

  @Get(':id')
  get(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.getById(Number(id), orgId, userId);
  }

  @Get(':id/full')
  full(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.getFull(Number(id), orgId, userId);
  }

  @Patch(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    return this.service.update(Number(id), dto, orgId, userId);
  }

  @Delete(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  remove(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.softDelete(Number(id), orgId, userId);
  }
}
