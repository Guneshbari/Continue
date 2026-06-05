import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

export interface ShelfRankingStrategy {
  fetch(prisma: PrismaService, config: ConfigService, limit: number): Promise<any[]>
}
