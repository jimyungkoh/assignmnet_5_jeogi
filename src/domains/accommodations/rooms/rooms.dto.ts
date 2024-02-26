import { IsDateString, IsNumber, IsString, Max, Min } from 'class-validator';

export class MakeReservationDto {
  @IsDateString()
  date: Date;
}

export class ReviewDto {
  @IsNumber()
  @Min(1, { message: '별점은 최솟값은 1점 입니다.' })
  @Max(5, { message: '별점은 최댓값은 5점 입니다.' })
  rating: number;

  @IsString()
  content: string;
}
