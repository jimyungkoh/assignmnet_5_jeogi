import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Accommodation,
  AccommodationType,
  Partner,
  Prisma,
  Room,
} from '@prisma/client';
import * as fs from 'fs/promises';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { RoomsService } from './rooms/rooms.service';

@Injectable()
export class AccommodationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roomsService: RoomsService,
  ) {}
  async createAccommodation(data: Prisma.AccommodationUncheckedCreateInput) {
    return await this.prismaService.accommodation.create({
      data,
    });
  }

  async getAccommodations(type?: AccommodationType) {
    return await this.prismaService.accommodation.findMany({
      where: { type },
    });
  }

  async getAccommodationById(accommodationId: number) {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId },
      include: { rooms: true },
    });

    return accommodation;
  }

  update(id: number) {
    return `This action updates a #${id} accommodation`;
  }

  remove(id: number) {
    return `This action removes a #${id} accommodation`;
  }

  async addRoomToAccommodation(
    partner: Pick<Partner, 'id'>,
    accommodationId: Accommodation['id'],
    data: Parameters<typeof this.roomsService.createRoom>[1],
  ) {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId, partnerId: partner.id },
    });

    if (!accommodation) throw new ForbiddenException();

    const room = await this.roomsService.createRoom(accommodationId, data);

    return room;
  }

  async deleteRoomFromAccommodation(
    accommodationId: Accommodation['id'],
    partnerId: Partner['id'],
    roomId: Room['id'],
  ) {
    // 룸 삭제를 요청한 파트너가 숙소의 파트너인지 확인
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id: accommodationId, partnerId: partnerId },
    });

    // 아니면 돌아가~
    if (!accommodation)
      throw new ForbiddenException('해당 숙소의 파트너가 아닙니다.');

    const room = await this.prismaService.room.findUnique({
      where: {
        id: roomId,
        accommodationId: accommodationId,
      },
    });

    // 룸이 없다면 NotFoundException
    if (!room) throw new NotFoundException('없는 방입니다.');

    const result = await this.prismaService.room.delete({
      where: { id: roomId },
    });

    return result;
  }

  async addImageToAccommodation(file: Express.Multer.File) {
    await fs.writeFile(`./public/${file.originalname}`, file.buffer, 'base64');

    return file;
  }
}
