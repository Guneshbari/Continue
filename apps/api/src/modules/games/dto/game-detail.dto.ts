import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsArray,
  IsInt,
} from 'class-validator'
import { Type } from 'class-transformer'
import { CoverManifestDto, BackdropManifestDto, ScreenshotDto } from './media-manifest.dto'
import { GameTaxonomyDto } from './game-summary.dto'

export class GameRatingDto {
  @ApiPropertyOptional({ description: 'Average rating of internal user reviews' })
  @IsOptional()
  @IsNumber()
  averageRating?: number | null

  @ApiProperty({ description: 'Total count of internal user reviews' })
  @IsInt()
  ratingCount!: number

  @ApiPropertyOptional({ description: 'Average rating from IGDB' })
  @IsOptional()
  @IsNumber()
  externalRating?: number | null

  @ApiPropertyOptional({ description: 'Total review counts from IGDB' })
  @IsOptional()
  @IsInt()
  externalRatingCount?: number | null
}

export class GameMetadataDto {
  @ApiPropertyOptional({ description: 'Release status (e.g., released, alpha, announced)' })
  @IsOptional()
  @IsString()
  status?: string | null

  @ApiPropertyOptional({ description: 'Primary developer name' })
  @IsOptional()
  @IsString()
  developer?: string | null

  @ApiPropertyOptional({ description: 'Primary publisher name' })
  @IsOptional()
  @IsString()
  publisher?: string | null

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'All associated developer names' })
  developers!: string[]

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'All associated publisher names' })
  publishers!: string[]

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'All associated game themes' })
  themes!: string[]

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'All approved user/system tags' })
  tags!: string[]

  @ApiPropertyOptional({ description: 'Associated franchise title' })
  @IsOptional()
  @IsString()
  franchise?: string | null
}

export class GameDetailDto {
  @ApiProperty({ description: 'Game unique CUID' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Game unique URL slug' })
  @IsString()
  slug!: string

  @ApiProperty({ description: 'Game title' })
  @IsString()
  title!: string

  @ApiPropertyOptional({ description: 'Brief descriptions or pitch text' })
  @IsOptional()
  @IsString()
  summary?: string | null

  @ApiPropertyOptional({ description: 'In-depth description of plot or storyline' })
  @IsOptional()
  @IsString()
  storyline?: string | null

  @ApiPropertyOptional({ description: 'Official release date in ISO format' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string | null

  @ApiProperty({ type: [GameTaxonomyDto], description: 'Associated genres' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameTaxonomyDto)
  genres!: GameTaxonomyDto[]

  @ApiProperty({ type: [GameTaxonomyDto], description: 'Supported platforms' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameTaxonomyDto)
  platforms!: GameTaxonomyDto[]

  @ApiPropertyOptional({ type: CoverManifestDto, description: 'Cover image asset variants' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoverManifestDto)
  cover?: CoverManifestDto | null

  @ApiPropertyOptional({
    type: BackdropManifestDto,
    description: 'Hero banner backdrop image variants',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BackdropManifestDto)
  backdrop?: BackdropManifestDto | null

  @ApiProperty({ type: [ScreenshotDto], description: 'List of game screenshots with hero details' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScreenshotDto)
  screenshots!: ScreenshotDto[]

  @ApiProperty({ type: GameRatingDto, description: 'Combined rating metrics' })
  @ValidateNested()
  @Type(() => GameRatingDto)
  rating!: GameRatingDto

  @ApiProperty({ type: GameMetadataDto, description: 'Descriptive contextual metadata' })
  @ValidateNested()
  @Type(() => GameMetadataDto)
  metadata!: GameMetadataDto
}
