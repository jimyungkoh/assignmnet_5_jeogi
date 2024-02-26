import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Partner, User } from '@prisma/client';
import { DAccount } from 'src/decorators/account.decorator';
import { Private } from 'src/decorators/private.decorator';
import { default as dayUtil } from 'src/utils/day';
import { MakeReservationDto, ReviewDto } from './rooms.dto';
import { RoomsService } from './rooms.service';

@Controller('/accommodations/:accommodationId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * @description 방 예약을 생성합니다.
   * @throws NotFoundException - 방이 없을 경우
   * @throws NotFoundException - 이미 예약된 방일 경우
   */
  @Post('/:roomId/reservations')
  @Private('user')
  async makeReservation(
    @DAccount('user') user: User,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() makeReservationDto: MakeReservationDto,
  ) {
    const { date } = makeReservationDto;

    const reservation = await this.roomsService.findReservationByRoomIdAndDate(
      roomId,
      dayUtil.startOfDay(date),
    );

    if (!reservation) throw new NotFoundException('없는 방입니다.');

    if (reservation.reservedAt)
      throw new NotFoundException('이미 예약된 방입니다.');

    return this.roomsService.makeReservation(
      user.id,
      roomId,
      dayUtil.startOfDay(date),
    );
  }

  /**
   * @summary 요구사항 8: 예약된 방의 체크인을 처리합니다.
   * @description
   *  - Partner는 isReserved 상태의 Reservation은 checkedInAt을 할당할 수 있다.
   * @throws BadRequestException - 예약되지 않은 방일 경우
   * @throws BadRequestException - 해당 방에 대한 예약이 아닌 경우
   * @throws BadRequestException - 해당 숙소에 대한 예약이 아닌 경우
   * @throws ForbiddenException - 해당 숙소의 체크인 권한이 없는 경우
   * @throws BadRequestException - 이미 체크인이 완료된 방일 경우
   */
  @Post('/:roomId/reservations/:reservationId/check-in')
  @Private('partner')
  async checkInReservation(
    @DAccount('partner') partner: Partner,
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('reservationId') reservationId: string,
  ) {
    const reservation =
      await this.roomsService.findReservationById(reservationId);

    if (!reservation) throw new BadRequestException('예약되지 않은 방입니다.');
    else if (reservation.room.id !== roomId)
      throw new BadRequestException('해당 방에 대한 예약이 아닙니다.');
    else if (reservation.room.accommodation.id !== accommodationId)
      throw new BadRequestException('해당 숙소에 대한 예약이 아닙니다.');
    else if (reservation.room.accommodation.partnerId !== partner.id)
      throw new ForbiddenException('해당 숙소의 체크인 권한이 없습니다.');
    else if (reservation.checkedInAt)
      throw new BadRequestException('이미 체크인이 완료된 방입니다.');

    return this.roomsService.checkInReservation(reservationId);
  }

  /**
   * @summary 요구사항 9: 방에 대한 리뷰를 생성합니다.
   * @description
   *   - checkedInAt 이 할당 된 Reservation에 대해 User는 Review를 생성할 수 있다.
   * @throws NotFoundException - 예약을 찾을 수 없는 경우
   * @throws BadRequestException - 해당 방에 대한 예약이 아닌 경우
   * @throws BadRequestException - 해당 숙소에 대한 예약이 아닌 경우
   * @throws BadRequestException - 예약된 방이 아닌 경우
   * @throws ForbiddenException - 해당 방의 예약자가 아닌 경우
   * @throws BadRequestException - 체크인하지 않은 방은 리뷰를 남길 수 없는 경우
   */
  @Post('/:roomId/reservations/:reservationId/reviews')
  @Private('user')
  async createReview(
    @DAccount('user') user: User,
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('reservationId') reservationId: string,
    @Body() reviewDto: ReviewDto,
  ) {
    const reservation =
      await this.roomsService.findReservationById(reservationId);

    if (!reservation) throw new NotFoundException('예약을 찾을 수 없습니다.');
    else if (reservation.room.id !== roomId)
      throw new BadRequestException('해당 방에 대한 예약이 아닙니다.');
    else if (reservation.room.accommodation.id !== accommodationId)
      throw new BadRequestException('해당 숙소에 대한 예약이 아닙니다.');
    else if (!reservation.reservedById)
      throw new BadRequestException('예약된 방이 아닙니다.');
    else if (reservation.reservedById !== user.id)
      throw new ForbiddenException('해당 방의 예약자가 아닙니다.');
    else if (!reservation.checkedInAt)
      throw new BadRequestException(
        '체크인하지 않은 방은 리뷰를 남길 수 없습니다.',
      );

    return this.roomsService.reviewRoom(reservation, reviewDto);
  }

  /**
   * @description 요구사항 10: 예약을 취소합니다.
   * @description
   *   - isReserved 상태의 Reservation은 일반 고객과 사업자 고객 양쪽 모두에 의해 취소 될 수 있다.
   * @throws NotFoundException - 예약을 찾을 수 없는 경우
   * @throws BadRequestException - 예약되지 않은 방일 경우
   * @throws BadRequestException - 체크인이 완료된 방일 경우
   * @throws ForbiddenException - 예약 취소 권한이 없는 경우
   */
  @Post('/:roomId/reservations/:reservationId/cancel')
  @Private('user' || 'partner')
  async cancelReservation(
    @Param('accommodationId', ParseIntPipe) accommodationId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('reservationId') reservationsId: string,
    @DAccount('user') user?: User,
    @DAccount('partner') partner?: Partner,
  ) {
    const reservation =
      await this.roomsService.findReservationById(reservationsId);

    if (!reservation) throw new NotFoundException('예약을 찾을 수 없습니다.');
    else if (!reservation.reservedAt)
      throw new BadRequestException('예약되지 않은 방입니다.');
    else if (reservation.checkedInAt)
      throw new BadRequestException('체크인이 완료된 방입니다.');
    else if ((!user && !partner) || reservation.reservedById !== user?.id)
      throw new ForbiddenException('예약 취소 권한이 없습니다.');

    return this.roomsService.cancelReservation(reservationsId);
  }
}
