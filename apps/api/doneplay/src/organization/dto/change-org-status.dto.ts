import { IsEnum } from 'class-validator';
import { OrganizationStatus } from '@prisma/client';

export class ChangeOrganizationStatusDto {
  @IsEnum(OrganizationStatus)
  status!: OrganizationStatus;
}
