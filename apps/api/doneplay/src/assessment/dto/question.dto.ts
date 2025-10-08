import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

const QUESTION_TYPES = [
  'SCALE',
  'TEXT',
  'MULTI_CHOICE',
  'SINGLE_CHOICE',
  'BOOLEAN',
] as const;
type QuestionTypeLiteral = (typeof QUESTION_TYPES)[number];

class InlineOptionDto {
  @IsString() @IsNotEmpty() value!: string;
  @IsString() @IsNotEmpty() label!: string;
  @IsOptional() order?: number;
}

export class CreateQuestionDto {
  @IsInt() bankId!: number;
  @IsString() @IsNotEmpty() @MaxLength(500) text!: string;
  @IsString() @IsOptional() code?: string;
  @IsIn(QUESTION_TYPES as unknown as string[]) type!: QuestionTypeLiteral;
  @IsOptional() optionSetId?: number;
  @IsOptional() minScale?: number;
  @IsOptional() maxScale?: number;
  @IsOptional() @IsObject() meta?: Record<string, any>;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InlineOptionDto)
  @IsOptional()
  options?: InlineOptionDto[];
}

export class UpdateQuestionDto {
  @IsString() @IsOptional() @MaxLength(500) text?: string;
  @IsString() @IsOptional() code?: string;
  @IsIn(QUESTION_TYPES as unknown as string[])
  @IsOptional()
  type?: QuestionTypeLiteral;
  @IsOptional() optionSetId?: number | null; // allow null to detach
  @IsOptional() minScale?: number | null;
  @IsOptional() maxScale?: number | null;
  @IsOptional() @IsObject() meta?: Record<string, any>;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InlineOptionDto)
  @IsOptional()
  options?: InlineOptionDto[];
}

export class ListQuestionQueryDto {
  @IsOptional() bankId?: number;
  @IsOptional() type?: QuestionTypeLiteral;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
  // Allow passing orgId (ignored in service; questions are global currently)
  @IsOptional() orgId?: number;
}
