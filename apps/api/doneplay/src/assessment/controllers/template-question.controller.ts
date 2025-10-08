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
import { TemplateQuestionService } from '../services/template-question.service';
import {
  AddTemplateQuestionDto,
  BulkSetSectionQuestionsDto,
  UpdateTemplateQuestionDto,
} from '../dto/template.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';

@Controller('template-questions')
@UseGuards(OrgContextGuard)
export class TemplateQuestionController {
  constructor(private readonly service: TemplateQuestionService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  add(@Body() dto: AddTemplateQuestionDto, @OrgId() _orgId: number) {
    return this.service.add(dto);
  }

  @Get(':sectionId')
  list(@Param('sectionId') sectionId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(sectionId));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateQuestionDto,
    @OrgId() _orgId: number,
  ) {
    return this.service.update(Number(id), dto);
  }

  @Post(':sectionId/bulk-set')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  bulk(
    @Param('sectionId') sectionId: string,
    @Body() dto: BulkSetSectionQuestionsDto,
    @OrgId() _orgId: number,
  ) {
    return this.service.bulkSet(Number(sectionId), dto.items);
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  remove(@Param('id') id: string, @OrgId() _orgId: number) {
    return this.service.remove(Number(id));
  }
}
