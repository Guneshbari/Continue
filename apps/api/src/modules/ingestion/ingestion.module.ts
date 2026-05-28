import { Module } from '@nestjs/common'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { ProvidersModule } from '../providers/providers.module'
import { TaxonomySyncService } from './services/taxonomy-sync.service'
import { MediaSyncService } from './services/media-sync.service'
import { GameSyncService } from './services/game-sync.service'
import { ProviderSyncService } from './services/provider-sync.service'

@Module({
  imports: [PrismaModule, ProvidersModule],
  providers: [
    TaxonomySyncService,
    MediaSyncService,
    GameSyncService,
    ProviderSyncService,
  ],
  exports: [ProviderSyncService],
})
export class IngestionModule {}
