import { ApiProperty } from '@nestjs/swagger'
import { GameSummaryDto } from './game-summary.dto'

export class ShelfDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  title!: string

  @ApiProperty({ type: [GameSummaryDto] })
  items!: GameSummaryDto[]
}
