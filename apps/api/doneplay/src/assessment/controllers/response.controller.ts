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
  async upsert(@Body() dto: CreateOrUpsertResponseDto) {
    const res = await this.service.upsert(dto);
    return { data: res, message: 'پاسخ ثبت شد' } as any;
  }

  @Post('bulk')
  async bulk(@Body() dto: BulkUpsertResponsesDto) {
    const res = await this.service.bulkUpsert(dto);
    return { data: res, message: 'پاسخ‌ها ثبت شدند' } as any;
  }

  @Get()
  list(@Query() q: ListResponsesQueryDto) {
    return this.service.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(Number(id));
  }

  @Get('progress/by')
  progress(@Query() q: any) {
    return this.service.progress(q);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.service.remove(Number(id));
    return { data: res, message: 'پاسخ حذف شد' } as any;
  }
}
