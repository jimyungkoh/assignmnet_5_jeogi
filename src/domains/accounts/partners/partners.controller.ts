import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from '../accounts.dto';
import { PartnerSignUpDto } from './partners.dto';
import { PartnersService } from './partners.service';

@Controller('accounts/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: PartnerSignUpDto) {
    return this.partnersService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return this.partnersService.signIn(signInDto);
  }
}
