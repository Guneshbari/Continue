import {
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export { GameDetailDto } from './game-detail.dto'
export { GameSummaryDto, TaxonomyDto } from './game-summary.dto'
export {
  BackdropManifestDto,
  CoverManifestDto,
  ScreenshotManifestDto,
} from './media-manifest.dto'
export {
  GAME_SORT_VALUES,
  GamesQueryDto,
  PaginatedGamesDto,
  type GameSortValue,
} from './pagination.dto'
export { ShelfDto } from './shelf.dto'

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
