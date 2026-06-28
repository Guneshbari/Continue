import { IsString, IsOptional, IsDateString, IsUrl, IsIn, IsInt, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export { GameDetailDto, GameRatingDto, GameMetadataDto } from './game-detail.dto'
export { GameSummaryDto, GameTaxonomyDto } from './game-summary.dto'
export { CoverManifestDto, BackdropManifestDto, ScreenshotDto } from './media-manifest.dto'
export { PaginatedResponseDto } from './pagination.dto'
export { ShelfDto } from './shelf.dto'

const SORT_VALUES = [
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
export type GameSortValue = (typeof SORT_VALUES)[number]

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

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

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

  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 24
}
