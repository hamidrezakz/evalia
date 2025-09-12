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
import { SessionService } from '../services/session.service';
import {
  CreateSessionDto,
  ListSessionQueryDto,
  UpdateSessionDto,
} from '../dto/session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() q: ListSessionQueryDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
}
