import { AccommodationType, Prisma } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';

export class AccommodationsRegisterDto {
  @IsEnum(AccommodationType)
  type: AccommodationType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsString()
  @IsNotEmpty()
  address2: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  @Validate((value: number) => !isNaN(value))
  longitude: number;

  @IsString()
  imgUrl?: string;

  @IsString()
  description?: string;
}

export class GetAccommodationsQueryTypeDto {
  @IsOptional()
  @IsEnum(AccommodationType)
  type: AccommodationType | undefined;
}

export type AccommodationsAddRoomDto =
  Prisma.RoomCreateWithoutAccommodationInput;
