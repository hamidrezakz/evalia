import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

const TEMPLATE_STATES = ['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'] as const;
export type TemplateStateLiteral = (typeof TEMPLATE_STATES)[number];

export class CreateTemplateDto {
  @IsString() @IsNotEmpty() @Length(2, 160) name!: string;
  @IsString() @IsOptional() @Length(2, 160) slug?: string;
  @IsString() @IsOptional() @MaxLength(800) description?: string;
  @IsOptional() @IsObject() meta?: Record<string, any>;
}

export class UpdateTemplateDto {
  @IsString() @IsOptional() @Length(2, 160) name?: string;
  @IsString() @IsOptional() @Length(2, 160) slug?: string;
  @IsString() @IsOptional() @MaxLength(800) description?: string | null;
  @IsIn(TEMPLATE_STATES as unknown as string[])
  @IsOptional()
  state?: TemplateStateLiteral;
  @IsOptional() @IsObject() meta?: Record<string, any>;
}

export class ListTemplateQueryDto {
  @IsOptional() search?: string;
  @IsOptional() state?: TemplateStateLiteral;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

export class CreateSectionDto {
  @IsInt() templateId!: number;
  @IsString() @IsNotEmpty() @Length(1, 160) title!: string;
  @IsOptional() order?: number;
}

export class UpdateSectionDto {
  @IsString() @IsOptional() @Length(1, 160) title?: string;
  @IsOptional() order?: number;
}

export class ReorderSectionsDto {
  @IsArray() @IsInt({ each: true }) sectionIds!: number[];
}

export class AddTemplateQuestionDto {
  @IsInt() sectionId!: number;
  @IsInt() questionId!: number;
  @IsOptional() order?: number;
  @IsArray() @IsString({ each: true }) @IsOptional() perspectives?: string[];
  @IsBoolean() @IsOptional() required?: boolean;
}

export class UpdateTemplateQuestionDto {
  @IsOptional() order?: number;
  @IsArray() @IsString({ each: true }) @IsOptional() perspectives?: string[];
  @IsBoolean() @IsOptional() required?: boolean;
}

export class BulkSetSectionQuestionsDto {
  @IsInt() sectionId!: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddTemplateQuestionDto)
  items!: AddTemplateQuestionDto[];
}
