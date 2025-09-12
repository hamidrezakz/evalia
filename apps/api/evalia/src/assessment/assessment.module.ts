import { TemplateController } from './controllers/template.controller';
import { SectionController } from './controllers/section.controller';
import { TemplateQuestionController } from './controllers/template-question.controller';
import { TemplateService } from './services/template.service';
import { SectionService } from './services/section.service';
import { TemplateQuestionService } from './services/template-question.service';
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
  ],
  exports: [
    QuestionBankService,
    QuestionService,
    OptionSetService,
    OptionSetOptionService,
    TemplateService,
    SectionService,
    TemplateQuestionService,
  ],
})
export class AssessmentModule {}
