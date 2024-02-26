import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import generateRandomId from 'src/utils/generateRandomId';
import { SignInDto } from '../accounts.dto';
import { PartnerSignUpDto } from './partners.dto';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtManagerService: JwtManagerService,
  ) {}

  async signUp(signUpDto: PartnerSignUpDto) {
    const foundPartner = await this.findPartnerByEmail(signUpDto.email);

    if (foundPartner)
      throw new BadRequestException('이미 존재하는 이메일입니다.');

    const id = generateRandomId();
    const encryptedPassword = await hash(signUpDto.password, 12);

    const data: Prisma.PartnerCreateInput = {
      id,
      email: signUpDto.email,
      encryptedPassword,
      businessName: signUpDto.businessName,
      phoneNumber: signUpDto.phoneNumber,
      staffName: signUpDto.staffName,
    };

    const partner = await this.prismaService.partner.create({
      data,
      select: {
        id: true,
        email: true,
      },
    });

    const accessToken = this.jwtManagerService.generateAccessToken({
      ...partner,
      accountType: 'partner',
    });

    return accessToken;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const partner = await this.findPartnerByEmail(email);

    if (!partner) throw new BadRequestException('존재하지 않는 이메일입니다.');

    const validPassword = await compare(password, partner.encryptedPassword);

    if (!validPassword)
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');

    const accessToken = this.jwtManagerService.generateAccessToken({
      ...partner,
      accountType: 'partner',
    });

    return accessToken;
  }

  async findPartnerByEmail(email: string) {
    return await this.prismaService.partner.findUnique({ where: { email } });
  }
}
