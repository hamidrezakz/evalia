import { IsEnum, IsOptional } from 'class-validator';
import { OrgRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsOptional()
  @IsEnum(OrgRole)
  role?: OrgRole;
}
