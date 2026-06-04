import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { GameSummaryDto } from './game-summary.dto'

export class ShelfDto {
  @ApiProperty({ description: 'Shelf unique ID (e.g. trending, top-rated, recent-releases)' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Display title for homepage shelf layout' })
  @IsString()
  title!: string

  @ApiProperty({ type: [GameSummaryDto], description: 'List of games placed on this shelf' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameSummaryDto)
  items!: GameSummaryDto[]
}
