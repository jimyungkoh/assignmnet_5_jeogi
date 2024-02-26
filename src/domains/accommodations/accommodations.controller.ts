import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccommodationType, Partner } from '@prisma/client';
import { DAccount } from 'src/decorators/account.decorator';
import { Private } from 'src/decorators/private.decorator';
import {
  AccommodationsAddRoomDto,
  AccommodationsRegisterDto,
} from './accommodations.dto';
import { AccommodationsService } from './accommodations.service';

@Controller('accommodations')
export class AccommodationsController {
  constructor(private readonly accommodationService: AccommodationsService) {}

  @Post()
  @Private('partner')
  registerAccommodation(
    @DAccount('partner') partner: Partner,
    @Body() dto: AccommodationsRegisterDto,
  ) {
    return this.accommodationService.createAccommodation({
      partnerId: partner.id,
      ...dto,
    });
  }

  @Get()
  getAccommodations(
    @Query('type') dto: AccommodationType | undefined,
    // @Query('check_in') checkIn: string | undefined,
    // @Query('check_out') checkOut: string | undefined,
  ) {
    const type = dto as AccommodationType | undefined;
    console.log(type);
    return this.accommodationService.getAccommodations(type);
  }

  @Get(':id')
  getAccommodationById(
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
  ) {
    return this.accommodationService.getAccommodationById(accommodationId);
  }

  @Patch(':accommodationId')
  @Private('partner')
  updateAccommodation() {} // @Param('accommodationId', ParseIntPipe) accommodationId: number,
  // @Body() dto: AccommodationsRegisterDto,
  // return this.accommodationService.updateAccommodation(id, dto);

  @Post(':accommodationId/rooms')
  @Private('partner')
  addRoom(
    @Body() addRoomDto: AccommodationsAddRoomDto,
    @DAccount('partner') partner: Partner,
    @Param('accommodationId') accommodationId: number,
  ) {
    return this.accommodationService.addRoomToAccommodation(
      partner,
      +accommodationId,
      addRoomDto,
    );
  }

  @Delete(':accommodationId/rooms/:roomId')
  @Private('partner')
  deleteRoom(
    @DAccount('partner') partner: Partner,
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.accommodationService.deleteRoomFromAccommodation(
      accommodationId,
      partner.id,
      roomId,
    );
  }

  @Post(':accommodationId/images')
  @Private('partner')
  @UseInterceptors(FileInterceptor('file'))
  uploadAccommodationMainImage(@UploadedFile() file: Express.Multer.File) {
    return this.accommodationService.addImageToAccommodation(file);
  }
}
