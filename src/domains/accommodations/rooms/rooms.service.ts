import { Injectable } from '@nestjs/common';
import { Prisma, Reservation } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ReviewDto } from './rooms.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRoom(
    accommodationId: number,
    dataWithoutAccommodationId: Prisma.RoomCreateWithoutAccommodationInput,
  ) {
    const data: Prisma.RoomUncheckedCreateInput = {
      accommodationId,
      ...dataWithoutAccommodationId,
    };

    const room = await this.prismaService.room.create({ data });

    return room;
  }

  async findReservationById(reservationId: Reservation['id']) {
    return await this.prismaService.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: {
          include: {
            accommodation: true,
          },
        },
      },
    });
  }

  async findReservationByRoomIdAndDate(
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    return await this.prismaService.reservation.findUnique({
      where: { roomId_date: { roomId, date } },
    });
  }

  async makeReservation(
    reservedById: Reservation['reservedById'],
    roomId: Reservation['roomId'],
    date: Reservation['date'],
  ) {
    const updatedReservation = await this.prismaService.reservation.update({
      where: { roomId_date: { roomId, date } },
      data: { reservedAt: new Date(), reservedById },
    });

    return updatedReservation;
  }

  async checkInReservation(reservationId: Reservation['id']) {
    const checkInResult = await this.prismaService.reservation.update({
      where: { id: reservationId },
      data: { checkedInAt: new Date() },
    });

    return checkInResult;
  }

  async reviewRoom(reservation: Reservation, reviewDto: ReviewDto) {
    if (!reservation.reservedById || !reservation.roomId) return null;

    const reviewResult = await this.prismaService.review.create({
      data: {
        userId: reservation.reservedById,
        roomId: reservation.roomId,
        rating: reviewDto.rating,
        content: reviewDto.content,
      },
    });

    return reviewResult;
  }

  async cancelReservation(reservationId: Reservation['id']) {
    const checkInResult = await this.prismaService.reservation.update({
      where: { id: reservationId },
      data: { reservedAt: null, reservedById: null, checkedInAt: null },
    });

    return checkInResult;
  }
}
