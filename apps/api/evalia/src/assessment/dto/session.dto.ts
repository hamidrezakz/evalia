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
} from 'class-validator';

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
  @IsArray() userIds!: number[];
  @IsString() @IsOptional() perspective?: string; // validated service-level
}

export class AddAssignmentDto {
  @IsInt() sessionId!: number;
  @IsInt() userId!: number;
  @IsString() @IsOptional() perspective?: string; // SELF default
}

export class UpdateAssignmentDto {
  @IsString() @IsOptional() perspective?: string;
}
