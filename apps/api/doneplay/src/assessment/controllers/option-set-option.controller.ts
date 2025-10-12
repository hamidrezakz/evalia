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
import { OrgContext } from '../../common/org-context.decorator';

@Controller('option-set-options')
@UseGuards(OrgContextGuard)
export class OptionSetOptionController {
  constructor(private readonly service: OptionSetOptionService) {}

  @Post(':optionSetId')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async bulkReplace(
    @Param('optionSetId') optionSetId: string,
    @Body() dto: BulkReplaceOptionSetOptionsDto,
    @OrgId() _orgId: number,
  ) {
    const res = await this.service.bulkReplace(Number(optionSetId), dto);
    return { data: res, message: 'گزینه‌های مجموعه بروزرسانی شدند' } as any;
  }

  @Get(':optionSetId')
  list(@Param('optionSetId') optionSetId: string, @OrgId() _orgId: number) {
    return this.service.list(Number(optionSetId));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @OrgId() _orgId: number,
  ) {
    const updated = await this.service.update(Number(id), dto);
    return { data: updated, message: 'گزینه بروزرسانی شد' } as any;
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async remove(@Param('id') id: string, @OrgId() _orgId: number) {
    const res = await this.service.remove(Number(id));
    return { data: res, message: 'گزینه حذف شد' } as any;
  }
}
