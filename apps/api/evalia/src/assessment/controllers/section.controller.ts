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

@Controller('template-sections')
export class SectionController {
  constructor(private readonly service: SectionService) {}

  @Post()
  create(@Body() dto: CreateSectionDto) {
    return this.service.create(dto);
  }

  @Get(':templateId')
  list(@Param('templateId') templateId: string) {
    return this.service.list(Number(templateId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.service.update(Number(id), dto);
  }

  @Post(':templateId/reorder')
  reorder(
    @Param('templateId') templateId: string,
    @Body() dto: ReorderSectionsDto,
  ) {
    return this.service.reorder(Number(templateId), dto.sectionIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
}
