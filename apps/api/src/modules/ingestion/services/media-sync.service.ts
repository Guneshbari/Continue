import { Injectable, Logger } from '@nestjs/common'
import type { PrismaService } from '../../../common/prisma/prisma.service'
import { MediaProcessingState } from '@prisma/client'

/**
 * Canonical Aspect Ratio Guidelines for future Sharp Optimization Phase:
 * ----------------------------------------------------------------------
 * The Continue platform enforces cinematic visual rhythm. These rules must be
 * followed during the future asynchronous Sharp transformation worker phase:
 * 
 * 1. Aspect Ratio Normalization Rules:
 *    - COVER_* (COVER_SM, COVER_MD, COVER_LG): Enforce strict '2:3' ratio.
 *    - BACKDROP_HERO: Enforce strict '16:9' ratio.
 *    - GALLERY_HD: Enforce strict '16:9' ratio.
 *    - THUMBNAIL_BLUR: Enforce strict '1:1' ratio.
 * 
 * 2. Processing & Metatada Rules:
 *    - Normalize ratios during Sharp processing (crop/resize from center).
 *    - Store original aspect metadata (original width, height) in MediaVariant.
 * 
 * 3. Lifecycle States governed inside MediaAsset:
 *    - PENDING: Initial state, asset registered but no variants optimized.
 *    - PROCESSING: Lock state while background worker operates.
 *    - READY: Asset successfully transformed and variants created.
 *    - FAILED: Failed processing, retryCount incremented, lastFailureReason populated.
 */
@Injectable()
export class MediaSyncService {
  private readonly logger = new Logger(MediaSyncService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotently resolves a single raw media asset URL, performing hash-based deduplication
   * and initializing lifecycle state tracking.
   */
  async resolveAsset(url: string | null, provider: 'igdb' | 'mock'): Promise<string | null> {
    if (!url) return null

    const hash = `${provider}:${url}`

    // 1. Check if the asset already exists to prevent duplication (hash-based deduplication)
    const existing = await this.prisma.mediaAsset.findUnique({
      where: { hash },
      select: { id: true },
    })

    if (existing) {
      return existing.id
    }

    // 2. Create the asset in PENDING state ready for future asynchronous processing
    const created = await this.prisma.mediaAsset.create({
      data: {
        rawUrl: url,
        hash,
        optimized: false,
        processingState: MediaProcessingState.PENDING,
        retryCount: 0,
      },
      select: { id: true },
    })

    return created.id
  }

  /**
   * Deduplicates and syncs an array of screenshot URLs, returning resolved MediaAsset IDs.
   */
  async resolveScreenshots(urls: string[], provider: 'igdb' | 'mock'): Promise<string[]> {
    const assetIds: string[] = []

    for (const url of urls) {
      const assetId = await this.resolveAsset(url, provider)
      if (assetId) {
        assetIds.push(assetId)
      }
    }

    return assetIds
  }
}
