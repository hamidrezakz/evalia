import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TemplateService } from '../services/template.service';
import {
  CreateTemplateDto,
  ListTemplateQueryDto,
  UpdateTemplateDto,
} from '../dto/template.dto';

@Controller('templates')
export class TemplateController {
  constructor(private readonly service: TemplateService) {}

  @Post()
  create(@Body() dto: CreateTemplateDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() q: ListTemplateQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Get(':id/full')
  full(@Param('id') id: string) {
    return this.service.getFull(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
}
