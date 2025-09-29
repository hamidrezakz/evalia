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
import { Roles } from '../../common/roles.decorator';

@Controller('option-sets')
export class OptionSetController {
  constructor(private readonly service: OptionSetService) {}

  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
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
  @Roles({ any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'] })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOptionSetDto) {
    return this.service.update(Number(id), dto);
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
}
