import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { AccountEntity, AccountType } from 'src/domains/accounts.type';

@Injectable()
export class JwtManagerService {
  constructor(private readonly configService: ConfigService) {}

  generateAccessToken(accountEntity: AccountEntity) {
    const { id: subject, email, accountType } = accountEntity;
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const accessToken = sign({ email, accountType }, secretKey, {
      subject,
    });
    return accessToken;
  }

  async verifyAccessToken(accessToken: string) {
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const { sub: id, accountType } = verify(
      accessToken,
      secretKey,
    ) as JwtPayload & { accountType: AccountType };
    return { id, accountTypeInToken: accountType };
  }
}
