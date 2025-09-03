import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { OrgRole, PlatformRole } from '@prisma/client';

export class CreateNavigationItemDto {
  @IsOptional()
  @IsInt()
  organizationId?: number | null;

  @IsOptional()
  @IsEnum(OrgRole)
  role?: OrgRole;

  @IsOptional()
  @IsEnum(PlatformRole)
  platformRole?: PlatformRole;

  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @IsString()
  label!: string;

  @ValidateIf((o) => !o.externalUrl)
  @IsOptional()
  @IsString()
  path?: string;

  @ValidateIf((o) => !o.path)
  @IsOptional()
  @IsUrl({ require_tld: false })
  externalUrl?: string;

  @IsOptional()
  @IsString()
  iconName?: string;

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
