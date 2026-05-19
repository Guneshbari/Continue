import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, MaxLength, IsOptional, MinLength } from 'class-validator'

export class CreateReviewDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string

  @ApiProperty({ minLength: 10, maxLength: 10000 })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  body!: string
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional({ minLength: 10, maxLength: 10000 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  body?: string
}
