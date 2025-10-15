import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginPasswordDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  // Optional: organization slug to ensure membership upon successful login
  @IsString()
  @IsOptional()
  orgSlug?: string;
}
