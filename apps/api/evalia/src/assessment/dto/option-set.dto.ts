import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class OptionSetItemDto {
  @IsString() @IsNotEmpty() value!: string;
  @IsString() @IsNotEmpty() label!: string;
  @IsOptional() order?: number;
  @IsOptional() @IsObject() meta?: Record<string, any>;
}

export class CreateOptionSetDto {
  @IsString() @IsNotEmpty() @Length(2, 120) name!: string;
  @IsString() @IsOptional() @Length(2, 64) code?: string;
  @IsString() @IsOptional() @MaxLength(500) description?: string;
  @IsBoolean() @IsOptional() isSystem?: boolean;
  @IsOptional() @IsObject() meta?: Record<string, any>;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionSetItemDto)
  @IsOptional()
  options?: OptionSetItemDto[];
}

export class UpdateOptionSetDto {
  @IsString() @IsOptional() @Length(2, 120) name?: string;
  @IsString() @IsOptional() @Length(2, 64) code?: string | null;
  @IsString() @IsOptional() @MaxLength(500) description?: string | null;
  @IsBoolean() @IsOptional() isSystem?: boolean;
  @IsOptional() @IsObject() meta?: Record<string, any>;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionSetItemDto)
  @IsOptional()
  options?: OptionSetItemDto[];
}

export class ListOptionSetQueryDto {
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

export class BulkReplaceOptionSetOptionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionSetItemDto)
  options!: OptionSetItemDto[];
}
