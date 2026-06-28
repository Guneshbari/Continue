import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { ProvidersModule } from '../providers/providers.module'
import { TaxonomySyncService } from './services/taxonomy-sync.service'
import { MediaSyncService } from './services/media-sync.service'
import { GameSyncService } from './services/game-sync.service'
import { ProviderSyncService } from './services/provider-sync.service'
import { GameSyncWorker } from '../queue/workers/game-sync.worker'
import {
  GAME_SYNC_QUEUE,
  MEDIA_PROCESSING_QUEUE,
  DEAD_LETTER_QUEUE,
} from '../queue/queue.constants'

@Module({
  imports: [
    PrismaModule,
    ProvidersModule,
    // Register the game-sync queue and DLQ dependencies inside IngestionModule
    BullModule.registerQueue(
      { name: GAME_SYNC_QUEUE },
      { name: MEDIA_PROCESSING_QUEUE },
      { name: DEAD_LETTER_QUEUE },
    ),
  ],
  providers: [
    TaxonomySyncService,
    MediaSyncService,
    GameSyncService,
    ProviderSyncService,
    GameSyncWorker, // Register the game-sync worker processor
  ],
  exports: [ProviderSyncService, MediaSyncService],
})
export class IngestionModule {}
