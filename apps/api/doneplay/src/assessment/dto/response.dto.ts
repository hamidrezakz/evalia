import {
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  IsIn,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateOrUpsertResponseDto {
  @IsInt() assignmentId!: number;
  @IsInt() sessionId!: number; // redundancy guard
  @IsInt() templateQuestionId!: number;

  // Different value channels (only one kind used depending on question type)
  @IsOptional() @IsNumber() scaleValue?: number;
  @IsOptional() @IsString() optionValue?: string;
  @IsOptional() @IsArray() optionValues?: string[];
  @IsOptional() @IsString() @MaxLength(4000) textValue?: string;
}

export class BulkUpsertResponsesDto {
  @IsArray() @ArrayNotEmpty() items!: CreateOrUpsertResponseDto[];
}

export class ListResponsesQueryDto {
  @IsInt() sessionId!: number; // required to scope
  @IsOptional() assignmentId?: number;
  @IsOptional() userId?: number;
  @IsOptional() templateQuestionId?: number;
  @IsOptional() questionId?: number; // convenience filter
  @IsOptional() perspective?: string; // validated in service
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}
