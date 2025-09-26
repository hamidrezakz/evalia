import {
  IsOptional,
  IsInt,
  IsEnum,
  IsString,
  Min,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserStatus } from '@prisma/client';

export class ListUsersDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  q?: string; // search in fullName / email / phone

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  orgId?: number; // filter users that have membership in this org

  @IsOptional()
  @IsString()
  teamName?: string; // filter by team name (membership)

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsArray()
  statuses?: UserStatus[]; // multi-status filter

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsInt()
  @Min(1)
  pageSize?: number = 20;

  // ISO date filters
  @IsOptional()
  @IsString()
  createdAtFrom?: string;

  @IsOptional()
  @IsString()
  createdAtTo?: string;

  // sort pattern: createdAt:desc,fullName:asc  (comma separated)
  @IsOptional()
  @IsString()
  sort?: string;

  // filter by platform/global roles (comma separated or array)
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  @IsArray()
  platformRoles?: string[];
}
