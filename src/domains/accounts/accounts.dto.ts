import { IsEmail, IsString, MinLength } from 'class-validator';

class SignDto {
  @IsEmail()
  @MinLength(1)
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}

export class SignUpDto extends SignDto {}

export class SignInDto extends SignDto {}
