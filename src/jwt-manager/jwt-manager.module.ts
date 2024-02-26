import { Module } from '@nestjs/common';
import { JwtManagerService } from './jwt-manager.service';

@Module({
  providers: [JwtManagerService],
  exports: [JwtManagerService],
})
export class JwtManagerModule {}
