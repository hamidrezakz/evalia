import { TemplateController } from './controllers/template.controller';
import { SectionController } from './controllers/section.controller';
import { TemplateQuestionController } from './controllers/template-question.controller';
import { SessionController } from './controllers/session.controller';
import { AssignmentController } from './controllers/assignment.controller';
import { ResponseController } from './controllers/response.controller';
import { TemplateService } from './services/template.service';
import { SectionService } from './services/section.service';
import { TemplateQuestionService } from './services/template-question.service';
import { SessionService } from './services/session.service';
import { AiExportService } from './services/ai-export.service';
import { AssignmentService } from './services/assignment.service';
import { ResponseService } from './services/response.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionBankService } from './services/question-bank.service';
import { QuestionService } from './services/question.service';
import { OptionSetService } from './services/option-set.service';
import { OptionSetOptionService } from './services/option-set-option.service';
import { QuestionBankController } from './controllers/question-bank.controller';
import { QuestionController } from './controllers/question.controller';
import { OptionSetController } from './controllers/option-set.controller';
import { OptionSetOptionController } from './controllers/option-set-option.controller';
import { InviteLinkController } from './controllers/invite-link.controller';
import { InviteLinkService } from './services/invite-link.service';

@Module({
  imports: [],
  controllers: [
    QuestionBankController,
    QuestionController,
    OptionSetController,
    OptionSetOptionController,
    TemplateController,
    SectionController,
    TemplateQuestionController,
    SessionController,
    AssignmentController,
    ResponseController,
    InviteLinkController,
  ],
  providers: [
    PrismaService,
    QuestionBankService,
    QuestionService,
    OptionSetService,
    OptionSetOptionService,
    TemplateService,
    SectionService,
    TemplateQuestionService,
    SessionService,
    AiExportService,
    AssignmentService,
    ResponseService,
    InviteLinkService,
  ],
  exports: [
    QuestionBankService,
    QuestionService,
    OptionSetService,
    OptionSetOptionService,
    TemplateService,
    SectionService,
    TemplateQuestionService,
    SessionService,
    AiExportService,
    AssignmentService,
    ResponseService,
    InviteLinkService,
  ],
})
export class AssessmentModule {}
