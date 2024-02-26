import { IsString, MinLength } from 'class-validator';
import { SignUpDto } from '../accounts.dto';

export class PartnerSignUpDto extends SignUpDto {
  @IsString()
  @MinLength(1)
  businessName: string;

  @IsString()
  @MinLength(1)
  staffName: string;

  @IsString()
  @MinLength(4)
  phoneNumber: string;
}
