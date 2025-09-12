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
import { OptionSetService } from '../services/option-set.service';
import {
  CreateOptionSetDto,
  ListOptionSetQueryDto,
  UpdateOptionSetDto,
} from '../dto/option-set.dto';

@Controller('option-sets')
export class OptionSetController {
  constructor(private readonly service: OptionSetService) {}

  @Post()
  create(@Body() dto: CreateOptionSetDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: ListOptionSetQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOptionSetDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
}
