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
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class UpdateNavigationItemDto {
  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @IsOptional()
  @IsArray()
  @IsEnum(PlatformRole, { each: true })
  @ArrayUnique()
  platformRoles?: PlatformRole[] | null;

  @IsOptional()
  @IsArray()
  @IsEnum(OrgRole, { each: true })
  @ArrayUnique()
  orgRoles?: OrgRole[] | null;

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
