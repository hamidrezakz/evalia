import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderNavigationItemDto {
  @IsInt()
  id!: number;

  @IsInt()
  @Min(0)
  order!: number;

  @IsInt()
  @Min(0)
  parentId!: number | null; // null allowed but validator expects number; enhance if needed
}

export class ReorderNavigationDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderNavigationItemDto)
  items!: ReorderNavigationItemDto[];
}
