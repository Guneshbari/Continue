import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Min, Max } from 'class-validator'

export class UpsertRatingDto {
  @ApiProperty({ minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  score!: number
}
