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
import { Roles } from '../../common/roles.decorator';

@Controller('template-questions')
export class TemplateQuestionController {
  constructor(private readonly service: TemplateQuestionService) {}

  @Post()
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  add(@Body() dto: AddTemplateQuestionDto) {
    return this.service.add(dto);
  }

  @Get(':sectionId')
  list(@Param('sectionId') sectionId: string) {
    return this.service.list(Number(sectionId));
  }

  @Patch(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateQuestionDto) {
    return this.service.update(Number(id), dto);
  }

  @Post(':sectionId/bulk-set')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  bulk(
    @Param('sectionId') sectionId: string,
    @Body() dto: BulkSetSectionQuestionsDto,
  ) {
    return this.service.bulkSet(Number(sectionId), dto.items);
  }

  @Delete(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
