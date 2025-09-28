import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { OrganizationStatus, OrgPlan } from '@prisma/client';

export class ListOrganizationsQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @IsOptional()
  @IsEnum(OrgPlan)
  plan?: OrgPlan;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10) || 1)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10) || 20)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  orderDir?: 'asc' | 'desc';
}
