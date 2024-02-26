import { Module } from '@nestjs/common';
import { AccommodationsController } from './accommodations.controller';
import { AccommodationsService } from './accommodations.service';
import { RegionsModule } from './regions/regions.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [RegionsModule, RoomsModule],
  controllers: [AccommodationsController],
  providers: [AccommodationsService],
})
export class AccommodationsModule {}
