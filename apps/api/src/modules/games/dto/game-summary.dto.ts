import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator'
import { Type } from 'class-transformer'
import { CoverManifestDto } from './media-manifest.dto'

export class GameTaxonomyDto {
  @ApiProperty({ description: 'Taxonomy entry unique ID' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Taxonomy entry unique slug' })
  @IsString()
  slug!: string

  @ApiProperty({ description: 'Taxonomy entry readable name' })
  @IsString()
  name!: string
}

export class GameSummaryDto {
  @ApiProperty({ description: 'Game unique ID' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Game unique URL slug' })
  @IsString()
  slug!: string

  @ApiProperty({ description: 'Game display title' })
  @IsString()
  title!: string

  @ApiPropertyOptional({ description: 'Release date in ISO format' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string | null

  @ApiPropertyOptional({ description: 'Average user review score' })
  @IsOptional()
  @IsNumber()
  averageRating?: number | null

  @ApiPropertyOptional({ type: CoverManifestDto, description: 'Cover image manifest' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoverManifestDto)
  cover?: CoverManifestDto | null

  @ApiProperty({ type: [GameTaxonomyDto], description: 'List of associated genres' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameTaxonomyDto)
  genres!: GameTaxonomyDto[]

  @ApiProperty({ type: [GameTaxonomyDto], description: 'List of supported platforms' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameTaxonomyDto)
  platforms!: GameTaxonomyDto[]
}
