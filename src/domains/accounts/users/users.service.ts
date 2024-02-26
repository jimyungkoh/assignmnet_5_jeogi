import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import generateRandomId from 'src/utils/generateRandomId';
import { SignInDto, SignUpDto } from '../accounts.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtManagerService: JwtManagerService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const foundUser = await this.findUserByEmail(signUpDto.email);

    if (foundUser) throw new BadRequestException('이미 존재하는 이메일입니다.');

    const id = generateRandomId();
    const encryptedPassword = await hash(signUpDto.password, 12);
    const data: Prisma.UserCreateInput = {
      id: generateRandomId(),
      email: signUpDto.email,
      encryptedPassword: encryptedPassword,
    };

    const user = await this.prismaService.user.create({
      data,
      select: { id: true, email: true },
    });

    const accessToken = this.jwtManagerService.generateAccessToken({
      ...user,
      accountType: 'user',
    });

    return accessToken;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const foundUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!foundUser)
      throw new BadRequestException('존재하지 않는 이메일입니다.');

    const validPassword = await compare(password, foundUser.encryptedPassword);

    if (!validPassword)
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');

    const accessToken = this.jwtManagerService.generateAccessToken({
      ...foundUser,
      accountType: 'user',
    });

    return accessToken;
  }

  async findUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({ where: { email } });
  }
}
