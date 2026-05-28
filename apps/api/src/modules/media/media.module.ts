import { Module } from '@nestjs/common'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { MediaStorageService } from './services/media-storage.service'
import { BlurPlaceholderService } from './services/blur-placeholder.service'
import { VariantGeneratorService } from './services/variant-generator.service'
import { MediaProcessingService } from './services/media-processing.service'

@Module({
  imports: [PrismaModule],
  providers: [
    MediaStorageService,
    BlurPlaceholderService,
    VariantGeneratorService,
    MediaProcessingService,
  ],
  exports: [
    MediaStorageService,
    BlurPlaceholderService,
    VariantGeneratorService,
    MediaProcessingService,
  ],
})
export class MediaModule {}
