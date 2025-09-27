import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuestionBankService } from '../services/question-bank.service';
import {
  CreateQuestionBankDto,
  ListQuestionBankQueryDto,
  UpdateQuestionBankDto,
} from '../dto/question-bank.dto';
import { Roles } from '../../common/roles.decorator';

@Controller('question-banks')
export class QuestionBankController {
  constructor(private readonly service: QuestionBankService) {}

  @Post()
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  create(@Body() dto: CreateQuestionBankDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: ListQuestionBankQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Patch(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  update(@Param('id') id: string, @Body() dto: UpdateQuestionBankDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }

  @Get(':id/questions-count')
  count(@Param('id') id: string) {
    return this.service.countQuestions(Number(id));
  }
}
