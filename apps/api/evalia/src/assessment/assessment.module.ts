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
  ],
  providers: [
    PrismaService,
    QuestionBankService,
    QuestionService,
    OptionSetService,
    OptionSetOptionService,
  ],
  exports: [
    QuestionBankService,
    QuestionService,
    OptionSetService,
    OptionSetOptionService,
  ],
})
export class AssessmentModule {}
