import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

const DISCOVERY_SORT_VALUES = [
  'popular',
  'rating',
  'release_date',
  'recently_added',
  'title',
] as const

export type DiscoverySortValue = (typeof DISCOVERY_SORT_VALUES)[number]

export class DiscoveryQueryDto {
  @ApiPropertyOptional({ description: 'Genre slug filter' })
  @IsOptional()
  @IsString()
  genre?: string

  @ApiPropertyOptional({ description: 'Platform slug filter' })
  @IsOptional()
  @IsString()
  platform?: string

  @ApiPropertyOptional({ description: 'Theme slug filter' })
  @IsOptional()
  @IsString()
  theme?: string

  @ApiPropertyOptional({ description: 'Release year filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  releaseYear?: number

  @ApiPropertyOptional({ description: 'Minimum average rating (1-10)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  ratingMin?: number

  @ApiPropertyOptional({ description: 'Maximum average rating (1-10)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  ratingMax?: number

  @ApiPropertyOptional({
    enum: DISCOVERY_SORT_VALUES,
    default: 'popular',
    description: 'Sort criteria',
  })
  @IsOptional()
  @IsIn(DISCOVERY_SORT_VALUES)
  sort: DiscoverySortValue = 'popular'

  @ApiPropertyOptional({ default: 1, description: 'Page index' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @ApiPropertyOptional({ default: 24, description: 'Max items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 24
}
