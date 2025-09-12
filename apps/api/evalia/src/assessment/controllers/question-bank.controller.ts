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

@Controller('question-banks')
export class QuestionBankController {
  constructor(private readonly service: QuestionBankService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() dto: UpdateQuestionBankDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
}
