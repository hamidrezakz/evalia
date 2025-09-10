import {
  IsInt,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';
import { OrgRole } from '@prisma/client';

export class AddMemberDto {
  @IsInt()
  userId!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(OrgRole, { each: true })
  roles!: OrgRole[];

  // For backward compatibility, allow single role
  @IsOptional()
  @IsEnum(OrgRole)
  role?: OrgRole;
}
