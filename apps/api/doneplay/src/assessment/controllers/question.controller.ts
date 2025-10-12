import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuestionService } from '../services/question.service';
import {
  CreateQuestionDto,
  ListQuestionQueryDto,
  UpdateQuestionDto,
} from '../dto/question.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';
import { OrgContext } from '../../common/org-context.decorator';

@Controller('questions')
@UseGuards(OrgContextGuard)
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async create(
    @Body() dto: CreateQuestionDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    // Attach orgId for multi-tenant scoping if service supports it (extend service signature if needed)
    const created = await this.service.create({ ...dto, orgId } as any);
    return { data: created, message: 'سوال ایجاد شد' } as any;
  }

  @Get()
  list(
    @Query() query: ListQuestionQueryDto,
    @OrgId() orgId: number,
    @Req() _req: any,
  ) {
    return this.service.list({ ...query, orgId } as any);
  }

  @Get(':id')
  get(@Param('id') id: string, @OrgId() _orgId: number) {
    return this.service.getById(Number(id));
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @OrgId() orgId: number,
  ) {
    const updated = await this.service.update(Number(id), {
      ...dto,
      orgId,
    } as any);
    return { data: updated, message: 'سوال بروزرسانی شد' } as any;
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  async remove(@Param('id') id: string, @OrgId() _orgId: number) {
    const res = await this.service.softDelete(Number(id));
    return { data: res, message: 'سوال حذف شد' } as any;
  }
}
