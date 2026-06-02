import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { GameSummaryDto, TaxonomyDto } from './game-summary.dto'
import { BackdropManifestDto, ScreenshotManifestDto } from './media-manifest.dto'

export class RatingDto {
  @ApiPropertyOptional()
  average!: number | null

  @ApiProperty()
  count!: number
}

export class GameMetadataDto {
  @ApiProperty({ type: [TaxonomyDto] })
  developers!: TaxonomyDto[]

  @ApiProperty({ type: [TaxonomyDto] })
  publishers!: TaxonomyDto[]

  @ApiProperty({ type: [TaxonomyDto] })
  tags!: TaxonomyDto[]

  @ApiProperty({ type: [TaxonomyDto] })
  themes!: TaxonomyDto[]

  @ApiPropertyOptional({ type: TaxonomyDto })
  franchise!: TaxonomyDto | null

  @ApiPropertyOptional()
  status!: string | null
}

export class GameDetailDto extends GameSummaryDto {
  @ApiPropertyOptional()
  summary!: string | null

  @ApiProperty({ type: [TaxonomyDto] })
  genres!: TaxonomyDto[]

  @ApiProperty({ type: [TaxonomyDto] })
  platforms!: TaxonomyDto[]

  @ApiPropertyOptional({ type: BackdropManifestDto })
  backdrop!: BackdropManifestDto | null

  @ApiProperty({ type: [ScreenshotManifestDto] })
  screenshots!: ScreenshotManifestDto[]

  @ApiProperty({ type: RatingDto })
  rating!: RatingDto

  @ApiProperty({ type: GameMetadataDto })
  metadata!: GameMetadataDto
}
