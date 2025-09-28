import { IsNotEmpty, IsString } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  purpose!: string; // e.g. LOGIN, REGISTER, RESET_PASSWORD
}
