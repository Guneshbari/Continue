import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { GameSummaryDto } from '../../games/dto/game-summary.dto'

export class SearchHighlightDto {
  @ApiProperty()
  field!: string

  @ApiProperty()
  snippet!: string
}

export class SearchResultDto extends GameSummaryDto {
  @ApiProperty({ example: 'game' })
  type = 'game' as const

  @ApiPropertyOptional({ type: [SearchHighlightDto] })
  highlights?: SearchHighlightDto[]
}

export class SearchSuggestionDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  slug!: string

  @ApiProperty()
  title!: string

  @ApiPropertyOptional({ description: 'Cover image URL, fallback role COVER_MD' })
  coverUrl!: string | null
}
