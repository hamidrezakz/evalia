import { IsEnum, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
import { OrgRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(OrgRole, { each: true })
  roles?: OrgRole[];
}
