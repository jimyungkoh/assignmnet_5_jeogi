import { Module } from '@nestjs/common';
import { JwtManagerModule } from 'src/jwt-manager/jwt-manager.module';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  imports: [JwtManagerModule],
  controllers: [PartnersController],
  providers: [PartnersService],
})
export class PartnersModule {}
