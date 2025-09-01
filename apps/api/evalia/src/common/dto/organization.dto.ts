import { Organization } from '@prisma/client';

export class OrganizationDto {
  id!: number;
  name!: string;
  slug!: string;
  plan!: string;
  status!: string;
  locale!: string;
  timezone!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static from(entity: Organization): OrganizationDto {
    const o = new OrganizationDto();
    o.id = entity.id;
    o.name = entity.name;
    o.slug = entity.slug;
    o.plan = entity.plan;
    o.status = entity.status;
    o.locale = entity.locale;
    o.timezone = entity.timezone;
    o.createdAt = entity.createdAt;
    o.updatedAt = entity.updatedAt;
    return o;
  }
}
