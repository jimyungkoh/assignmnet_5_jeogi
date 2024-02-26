import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AccountType } from 'src/domains/accounts.type';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';

@Injectable()
export class AuthGuard implements CanActivate {
  accountTypeMap: Record<AccountType, { model: any; typeName: string }>;

  constructor(
    private readonly jwtManagerService: JwtManagerService,
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {
    this.accountTypeMap = {
      user: { model: this.prismaService.user, typeName: 'user' },
      partner: { model: this.prismaService.partner, typeName: 'partner' },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 'accountType' 메타데이터 키를 가진 메타데이터 밸류를 가져옴
    const accountTypeInDecorator =
      this.reflector.getAllAndOverride<AccountType>('accountType', [
        context.getHandler(),
        context.getClass(),
      ]);

    if (accountTypeInDecorator === undefined) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);

    if (!accessToken) throw new UnauthorizedException();

    const { id, accountTypeInToken } =
      await this.jwtManagerService.verifyAccessToken(accessToken);

    if (accountTypeInDecorator !== accountTypeInToken)
      throw new ForbiddenException('접근 권한이 없습니다.');

    const { model, typeName: accountType } =
      this.accountTypeMap[accountTypeInDecorator];

    await model
      .findUniqueOrThrow({
        where: { id },
      })
      .then((entity: any) => {
        request[accountType as AccountType] = entity;
      })
      .catch(() => {
        throw new UnauthorizedException();
      });

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
