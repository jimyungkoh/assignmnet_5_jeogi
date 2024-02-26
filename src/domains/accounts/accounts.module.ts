import { Module } from '@nestjs/common';
import { PartnersModule } from './partners/partners.module';
import { UsersModule } from './users/users.module';
import { JwtManagerModule } from 'src/jwt-manager/jwt-manager.module';

@Module({
  imports: [UsersModule, PartnersModule, JwtManagerModule],
})
export class AccountsModule {}
