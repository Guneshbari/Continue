import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { MediaStorageService } from './services/media-storage.service'
import { BlurPlaceholderService } from './services/blur-placeholder.service'
import { VariantGeneratorService } from './services/variant-generator.service'
import { MediaProcessingService } from './services/media-processing.service'
import { MediaProcessingWorker } from '../queue/workers/media-processing.worker'
import { MEDIA_PROCESSING_QUEUE, DEAD_LETTER_QUEUE } from '../queue/queue.constants'

@Module({
  imports: [
    PrismaModule,
    // Register the media-processing queue and DLQ dependencies inside MediaModule
    BullModule.registerQueue({ name: MEDIA_PROCESSING_QUEUE }, { name: DEAD_LETTER_QUEUE }),
  ],
  providers: [
    MediaStorageService,
    BlurPlaceholderService,
    VariantGeneratorService,
    MediaProcessingService,
    MediaProcessingWorker, // Register the media-processing worker processor
  ],
  exports: [
    MediaStorageService,
    BlurPlaceholderService,
    VariantGeneratorService,
    MediaProcessingService,
  ],
})
export class MediaModule {}
