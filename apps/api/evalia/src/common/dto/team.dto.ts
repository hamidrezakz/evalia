import { Team } from '@prisma/client';

export class TeamDto {
  id!: number;
  name!: string;
  slug!: string;
  description?: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static from(entity: Team): TeamDto {
    const t = new TeamDto();
    t.id = entity.id;
    t.name = entity.name;
    t.slug = entity.slug;
    t.description = entity.description;
    t.createdAt = entity.createdAt;
    t.updatedAt = entity.updatedAt;
    return t;
  }
}
