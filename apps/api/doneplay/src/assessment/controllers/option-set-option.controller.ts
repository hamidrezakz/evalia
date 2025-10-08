import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OptionSetOptionService } from '../services/option-set-option.service';
import { BulkReplaceOptionSetOptionsDto } from '../dto/option-set.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';

@Controller('option-set-options')
@UseGuards(OrgContextGuard)
export class OptionSetOptionController {
  constructor(private readonly service: OptionSetOptionService) {}

  @Post(':optionSetId')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  bulkReplace(
    @Param('optionSetId') optionSetId: string,
    @Body() dto: BulkReplaceOptionSetOptionsDto,
    @OrgId() _orgId: number,
  ) {
    return this.service.bulkReplace(Number(optionSetId), dto);
  }

  @Get(':optionSetId')
  list(@Param('optionSetId') optionSetId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(optionSetId));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  update(@Param('id') id: string, @Body() dto: any, @OrgId() _orgId: number) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  remove(@Param('id') id: string, @OrgId() _orgId: number) {
    return this.service.remove(Number(id));
  }
}
