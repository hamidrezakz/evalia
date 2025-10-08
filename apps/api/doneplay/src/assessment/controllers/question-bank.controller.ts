import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuestionBankService } from '../services/question-bank.service';
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
} from '../dto/question-bank.dto';
import { Roles } from '../../common/roles.decorator';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgId } from '../../common/org-id.decorator';

@Controller('question-banks')
@UseGuards(OrgContextGuard)
export class QuestionBankController {
  constructor(private readonly service: QuestionBankService) {}

  @Post()
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  create(
    @Body() dto: CreateQuestionBankDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    return this.service.create(dto, orgId, userId);
  }

  @Get()
  list(@OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    // Leaving query filters minimal; could be extended to accept DTO again
    return this.service.list({}, orgId, userId);
  }

  @Get(':id')
  get(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.getById(Number(id), orgId, userId);
  }

  @Patch(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionBankDto,
    @OrgId() orgId: number,
    @Req() req: any,
  ) {
    const userId = req?.user?.userId;
    return this.service.update(Number(id), dto, orgId, userId);
  }

  @Delete(':id')
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER', 'ORG:OWNER', 'ORG:MANAGER'],
  })
  remove(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.softDelete(Number(id), orgId, userId);
  }

  @Get(':id/questions-count')
  count(@Param('id') id: string, @OrgId() orgId: number, @Req() req: any) {
    const userId = req?.user?.userId;
    return this.service.countQuestions(Number(id), orgId, userId);
  }
}
