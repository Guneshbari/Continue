import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  Min,
  Max,
  IsInt,
  IsIn,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

const SORT_VALUES = ['trending', 'top-rated', 'new', 'upcoming'] as const
export type GameSortValue = typeof SORT_VALUES[number]

export class CreateGameDto {
  @ApiProperty()
  @IsString()
  slug!: string

  @ApiProperty()
  @IsString()
  title!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  bannerUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  releaseDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  developer?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publisher?: string
}

export class GamesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genre?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platform?: string

  @ApiPropertyOptional({ enum: SORT_VALUES })
  @IsOptional()
  @IsIn(SORT_VALUES)
  sort?: GameSortValue

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  minRating?: number

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20
}
