import { IsOptional, IsInt, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { OrgRole, PlatformRole } from '@prisma/client';

export class ListNavigationItemsDto {
  // Filter items containing at least one of these platform roles
  @IsOptional()
  @IsArray()
  platformRoles?: PlatformRole[];

  // Filter items containing at least one of these org roles
  @IsOptional()
  @IsArray()
  orgRoles?: OrgRole[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @IsOptional()
  @IsInt()
  skip?: number;

  @IsOptional()
  @IsInt()
  take?: number;
}
