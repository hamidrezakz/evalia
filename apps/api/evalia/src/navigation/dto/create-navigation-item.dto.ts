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
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';
import { OrgRole, PlatformRole } from '@prisma/client';

export class CreateNavigationItemDto {
  @IsOptional()
  @IsInt()
  parentId?: number | null;

  // Optional arrays of roles; empty or undefined => public/generic item
  @IsOptional()
  @IsArray()
  @IsEnum(PlatformRole, { each: true })
  @ArrayUnique()
  platformRoles?: PlatformRole[];

  @IsOptional()
  @IsArray()
  @IsEnum(OrgRole, { each: true })
  @ArrayUnique()
  orgRoles?: OrgRole[];

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
