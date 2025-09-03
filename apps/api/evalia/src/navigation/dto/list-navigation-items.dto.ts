import { IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { OrgRole, PlatformRole } from '@prisma/client';

export class ListNavigationItemsDto {
  @IsOptional()
  @IsInt()
  organizationId?: number | null;

  @IsOptional()
  @IsEnum(OrgRole)
  role?: OrgRole | null;

  @IsOptional()
  @IsEnum(PlatformRole)
  platformRole?: PlatformRole | null;

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
