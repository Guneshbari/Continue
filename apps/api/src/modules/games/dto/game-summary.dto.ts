import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CoverManifestDto } from './media-manifest.dto'

export class TaxonomyDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  slug!: string

  @ApiProperty()
  name!: string
}

export class GameSummaryDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  slug!: string

  @ApiProperty()
  title!: string

  @ApiPropertyOptional()
  releaseDate!: string | null

  @ApiPropertyOptional()
  averageRating!: number | null

  @ApiPropertyOptional({ type: CoverManifestDto })
  cover!: CoverManifestDto | null
}
