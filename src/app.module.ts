import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { AccountsModule } from './domains/accounts/accounts.module';
import { DomainsModule } from './domains/domains.module';
import { AuthGuard } from './guards/auth.guard';
import { JwtManagerModule } from './jwt-manager/jwt-manager.module';

@Module({
  imports: [
    DomainsModule,
    PrismaModule,
    AccountsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
