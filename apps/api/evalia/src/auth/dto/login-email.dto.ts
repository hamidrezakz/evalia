import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
