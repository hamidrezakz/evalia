// Avoid requiring @nestjs/mapped-types if not installed by manually redefining optional fields
import { OrgRole, PlatformRole } from '@prisma/client';
import {
  IsOptional,
  IsInt,
  IsEnum,
  IsString,
  IsUrl,
  IsBoolean,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateNavigationItemDto {
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
  @IsInt()
  parentId?: number | null;

  @IsOptional()
  @IsString()
  label?: string;

  @ValidateIf((o) => !o.externalUrl)
  @IsOptional()
  @IsString()
  path?: string | null;

  @ValidateIf((o) => !o.path)
  @IsOptional()
  @IsUrl({ require_tld: false })
  externalUrl?: string | null;

  @IsOptional()
  @IsString()
  iconName?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  meta?: any;
}
