import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TemplateQuestionService } from '../services/template-question.service';
import {
  AddTemplateQuestionDto,
  BulkSetSectionQuestionsDto,
  UpdateTemplateQuestionDto,
} from '../dto/template.dto';

@Controller('template-questions')
export class TemplateQuestionController {
  constructor(private readonly service: TemplateQuestionService) {}

  @Post()
  add(@Body() dto: AddTemplateQuestionDto) {
    return this.service.add(dto);
  }

  @Get(':sectionId')
  list(@Param('sectionId') sectionId: string) {
    return this.service.list(Number(sectionId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateQuestionDto) {
    return this.service.update(Number(id), dto);
  }

  @Post(':sectionId/bulk-set')
  bulk(
    @Param('sectionId') sectionId: string,
    @Body() dto: BulkSetSectionQuestionsDto,
  ) {
    return this.service.bulkSet(Number(sectionId), dto.items);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
