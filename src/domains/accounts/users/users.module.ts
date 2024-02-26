import { Module } from '@nestjs/common';
import { JwtManagerModule } from 'src/jwt-manager/jwt-manager.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [JwtManagerModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
