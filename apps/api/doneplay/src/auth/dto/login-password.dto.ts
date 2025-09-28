import { IsNotEmpty, IsString } from 'class-validator';

export class LoginPasswordDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
