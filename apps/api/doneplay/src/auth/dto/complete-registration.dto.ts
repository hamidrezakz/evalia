import { IsOptional, IsString, MinLength } from 'class-validator';

export class CompleteRegistrationDto {
  @IsString()
  signupToken!: string; // token returned from verifyOtp when mode=SIGNUP

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
