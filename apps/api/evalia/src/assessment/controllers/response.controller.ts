import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ResponseService } from '../services/response.service';
import {
  BulkUpsertResponsesDto,
  CreateOrUpsertResponseDto,
  ListResponsesQueryDto,
} from '../dto/response.dto';

@Controller('responses')
export class ResponseController {
  constructor(private readonly service: ResponseService) {}

  @Post()
  upsert(@Body() dto: CreateOrUpsertResponseDto) {
    return this.service.upsert(dto);
  }

  @Post('bulk')
  bulk(@Body() dto: BulkUpsertResponsesDto) {
    return this.service.bulkUpsert(dto);
  }

  @Get()
  list(@Query() q: ListResponsesQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
