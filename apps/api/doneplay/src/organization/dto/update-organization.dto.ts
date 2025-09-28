import {
  IsOptional,
  IsString,
  IsEnum,
  Matches,
  IsEmail,
} from 'class-validator';
import { OrgPlan, Locale } from '@prisma/client';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
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
  timezone?: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;
}
