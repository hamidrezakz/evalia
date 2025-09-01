import {
  IsOptional,
  IsString,
  IsEnum,
  IsTimeZone,
  Matches,
} from 'class-validator';
import { OrgPlan, Locale } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug format invalid' })
  slug?: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;

  @IsOptional()
  @IsEnum(OrgPlan)
  plan?: OrgPlan;

  @IsOptional()
  @IsString()
  timezone?: string; // simple string for now
}
