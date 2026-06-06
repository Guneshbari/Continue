import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { GameSummaryRecord } from '../discovery.constants'

export interface ShelfRankingStrategy {
  fetch(prisma: PrismaService, config: ConfigService, limit: number): Promise<GameSummaryRecord[]>
}
