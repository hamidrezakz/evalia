import { IsOptional, IsString, Matches } from 'class-validator';

export class AddTeamDto {
  @IsString()
  name!: string;

  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug format invalid' })
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
