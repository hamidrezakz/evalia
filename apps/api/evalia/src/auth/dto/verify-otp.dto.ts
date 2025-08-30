import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}
