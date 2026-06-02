import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { GameSummaryDto } from './game-summary.dto'

export const GAME_SORT_VALUES = [
  'popular',
  'release_date',
  'rating',
  'recently_added',
  'trending',
  'top-rated',
  'most-reviewed',
  'newest',
  'recently-released',
  'upcoming',
  'new',
] as const

export type GameSortValue = typeof GAME_SORT_VALUES[number]

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

  @ApiPropertyOptional({ enum: GAME_SORT_VALUES })
  @IsOptional()
  @IsIn(GAME_SORT_VALUES)
  sort?: GameSortValue

  @ApiPropertyOptional({ description: 'Deprecated cursor parameter; page pagination is canonical.' })
  @IsOptional()
  @IsString()
  cursor?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 24

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

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxRating?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  minReviewCount?: number
}

export class PaginatedGamesDto {
  @ApiProperty({ type: [GameSummaryDto] })
  items!: GameSummaryDto[]

  @ApiProperty()
  page!: number

  @ApiProperty()
  limit!: number

  @ApiProperty()
  total!: number

  @ApiProperty()
  hasNext!: boolean
}
