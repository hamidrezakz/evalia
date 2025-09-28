import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ResponsePerspective } from '@prisma/client';

export enum SessionStateDto {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateSessionDto {
  @IsInt() organizationId!: number;
  @IsInt() templateId!: number;
  @IsInt() @IsOptional() teamScopeId?: number;
  @IsString() @IsNotEmpty() @Length(2, 160) name!: string;
  @IsString() @IsOptional() @MaxLength(800) description?: string;
  @IsDateString() startAt!: string;
  @IsDateString() endAt!: string;
  @IsObject() @IsOptional() meta?: Record<string, any>;
}

export class UpdateSessionDto {
  @IsString() @IsOptional() @Length(2, 160) name?: string;
  @IsString() @IsOptional() @MaxLength(800) description?: string | null;
  @IsEnum(SessionStateDto) @IsOptional() state?: SessionStateDto;
  @IsDateString() @IsOptional() startAt?: string;
  @IsDateString() @IsOptional() endAt?: string;
  @IsInt() @IsOptional() teamScopeId?: number | null;
  @IsObject() @IsOptional() meta?: Record<string, any>;
  @IsBoolean() @IsOptional() force?: boolean;
}

export class ListSessionQueryDto {
  @IsOptional() organizationId?: number;
  @IsOptional() templateId?: number;
  @IsOptional() state?: SessionStateDto;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

export class BulkAssignDto {
  @IsInt() sessionId!: number;
  // Legacy: bulk SELF by multiple respondents (kept for backward-compat)
  @IsOptional() @IsArray() userIds?: number[];
  // New: assign one respondent to many subjects
  @IsOptional() @IsInt() respondentUserId?: number;
  @IsOptional() @IsArray() subjectUserIds?: number[];
  @IsString() @IsOptional() perspective?: string; // validated in service; default SELF
}

export class AddAssignmentDto {
  @IsInt() sessionId!: number;
  // Legacy field for respondent (kept for compat)
  @IsOptional() @IsInt() userId?: number;
  // New explicit fields
  @IsOptional() @IsInt() respondentUserId?: number;
  @IsOptional() @IsInt() subjectUserId?: number;
  @IsString() @IsOptional() perspective?: string; // SELF default
}

export class UpdateAssignmentDto {
  @IsString() @IsOptional() perspective?: string;
  @IsOptional() @IsInt() subjectUserId?: number;
}

// --- User-centric DTOs ---
export class ListUserSessionsQueryDto {
  @IsOptional()
  @IsEnum(SessionStateDto)
  state?: SessionStateDto;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  organizationId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  pageSize?: number = 20;
}

export class UserQuestionsQueryDto {
  @IsEnum(ResponsePerspective)
  perspective!: ResponsePerspective;
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  subjectUserId?: number;
}
