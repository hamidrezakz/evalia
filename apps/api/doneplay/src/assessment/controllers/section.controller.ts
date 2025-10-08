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

@Controller('template-sections')
@UseGuards(OrgContextGuard)
export class SectionController {
  constructor(private readonly service: SectionService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  create(@Body() dto: CreateSectionDto, @OrgId() _orgId: number) {
    return this.service.create(dto);
  }

  @Get(':templateId')
  list(@Param('templateId') templateId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(templateId));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @OrgId() _orgId: number,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Post(':templateId/reorder')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  reorder(
    @Param('templateId') templateId: string,
    @Body() dto: ReorderSectionsDto,
    @OrgId() _orgId: number,
  ) {
    return this.service.reorder(Number(templateId), dto.sectionIds);
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  remove(@Param('id') id: string, @OrgId() _orgId: number) {
    return this.service.softDelete(Number(id));
  }
}
