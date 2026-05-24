import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, MaxLength, IsOptional, MinLength, IsEnum, IsBoolean } from 'class-validator'
import { ReviewStatus } from '@prisma/client'

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

  @ApiPropertyOptional({ enum: ReviewStatus, default: ReviewStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSpoiler?: boolean
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

  @ApiPropertyOptional({ enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSpoiler?: boolean
}

