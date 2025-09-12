import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { OptionSetOptionService } from '../services/option-set-option.service';
import { BulkReplaceOptionSetOptionsDto } from '../dto/option-set.dto';

@Controller('option-set-options')
export class OptionSetOptionController {
  constructor(private readonly service: OptionSetOptionService) {}

  @Post(':optionSetId')
  bulkReplace(
    @Param('optionSetId') optionSetId: string,
    @Body() dto: BulkReplaceOptionSetOptionsDto,
  ) {
    return this.service.bulkReplace(Number(optionSetId), dto);
  }

  @Get(':optionSetId')
  list(@Param('optionSetId') optionSetId: string) {
    return this.service.list(Number(optionSetId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
