import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SectionService } from '../services/section.service';
import {
  CreateSectionDto,
  ReorderSectionsDto,
  UpdateSectionDto,
} from '../dto/template.dto';
import { Roles } from '../../common/roles.decorator';

@Controller('template-sections')
export class SectionController {
  constructor(private readonly service: SectionService) {}

  @Post()
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  create(@Body() dto: CreateSectionDto) {
    return this.service.create(dto);
  }

  @Get(':templateId')
  list(@Param('templateId') templateId: string) {
    return this.service.list(Number(templateId));
  }

  @Patch(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.service.update(Number(id), dto);
  }

  @Post(':templateId/reorder')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  reorder(
    @Param('templateId') templateId: string,
    @Body() dto: ReorderSectionsDto,
  ) {
    return this.service.reorder(Number(templateId), dto.sectionIds);
  }

  @Delete(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
}
