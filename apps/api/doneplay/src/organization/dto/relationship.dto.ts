import { IsIn, IsInt, Min } from 'class-validator';

const REL_TYPES = [
  'PARENT_CHILD',
  'FRANCHISE',
  'MANAGED',
  'BRAND_ALIAS',
] as const;
export type RelationshipTypeLiteral = (typeof REL_TYPES)[number];

export class CreateRelationshipDto {
  @IsInt()
  @Min(1)
  parentOrganizationId!: number;

  @IsInt()
  @Min(1)
  childOrganizationId!: number;

  @IsIn(REL_TYPES as unknown as string[])
  relationshipType!: RelationshipTypeLiteral;

  // Optional toggle whether child inherits resources operationally (defaults true at DB)
  cascadeResources?: boolean;
}

export class DeleteRelationshipDto {
  @IsInt()
  @Min(1)
  parentOrganizationId!: number;

  @IsInt()
  @Min(1)
  childOrganizationId!: number;
}

export const RelationshipTypeLiterals = REL_TYPES;
