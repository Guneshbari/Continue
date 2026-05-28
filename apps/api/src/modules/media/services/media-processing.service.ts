import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { MediaStorageService } from './media-storage.service'
import { BlurPlaceholderService } from './blur-placeholder.service'
import { VariantGeneratorService } from './variant-generator.service'
import { MediaProcessingState, MediaRole } from '@prisma/client'
import axios from 'axios'
import sharp from 'sharp'
import * as crypto from 'crypto'

// Bounded Concurrency Semaphore to protect Node memory pressure from Sharp batch runs
class Semaphore {
  private activeCount = 0
  private queue: Array<() => void> = []

  constructor(private readonly limit: number) {}

  async acquire(): Promise<void> {
    if (this.activeCount < this.limit) {
      this.activeCount++
      return
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve)
    })
  }

  release(): void {
    this.activeCount--
    const next = this.queue.shift()
    if (next) {
      this.activeCount++
      next()
    }
  }
}

@Injectable()
export class MediaProcessingService {
  private readonly logger = new Logger(MediaProcessingService.name)
  private readonly sharpSemaphore = new Semaphore(3) // Bound transformations to 3 concurrent slots

  // Strict visual settings fingerprint definition
  private readonly settingsFingerprint: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
    private readonly placeholders: BlurPlaceholderService,
    private readonly generator: VariantGeneratorService
  ) {
    const activeSettings = {
      pipelineVersion: 'v1.0',
      quality: 80,
      crop: 'centre',
      sharpVersion: '0.34'
    }
    this.settingsFingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(activeSettings))
      .digest('hex')
  }

  /**
   * Orchestrates the high-fidelity media transformation lifecycle for a single MediaAsset.
   * Fully idempotent, delta-aware, and retry-safe.
   */
  async processAsset(assetId: string): Promise<void> {
    const startTime = Date.now()

    // 1. Fetch asset details and relationship metrics
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id: assetId },
      include: {
        coverGames: { select: { id: true } },
        backdropGames: { select: { id: true } },
        screenshots: { select: { id: true } },
      },
    })

    if (!asset) {
      this.logger.error(`❌ MediaAsset ID ${assetId} not found in database.`)
      return
    }

    // Incremental build check: If asset is READY and fingerprint matches, skip reprocessing
    if (
      asset.processingState === MediaProcessingState.READY &&
      asset.transformationFingerprint === this.settingsFingerprint
    ) {
      this.logger.log(`⏭️ MediaAsset ${assetId} is already optimized and settings match. Skipping processing.`)
      return
    }

    // Lock asset in PROCESSING state immediately
    await this.prisma.mediaAsset.update({
      where: { id: assetId },
      data: { processingState: MediaProcessingState.PROCESSING },
    })

    try {
      this.logger.log(`⏳ Processing MediaAsset ${assetId} (State Locked: PROCESSING)`)

      // 2. Resolve or download raw image buffer
      let rawBuffer: Buffer

      const isMockUrl = asset.rawUrl.startsWith('mock:') || !asset.rawUrl.startsWith('http')

      if (isMockUrl) {
        // Read existing preserved original or generate self-contained solid colored canvas offline
        const exists = await this.storage.originalExists(assetId)
        if (exists) {
          rawBuffer = await this.storage.readOriginal(assetId)
        } else {
          rawBuffer = await sharp({
            create: {
              width: 1920,
              height: 1080,
              channels: 4,
              background: { r: 31, g: 41, b: 55, alpha: 1 }, // slate grey cinematic background
            },
          })
            .png()
            .toBuffer()
          await this.storage.saveOriginal(assetId, rawBuffer)
        }
      } else {
        // Retrieve master binary from internet (or use cached master file if already preserved)
        const exists = await this.storage.originalExists(assetId)
        if (exists) {
          rawBuffer = await this.storage.readOriginal(assetId)
        } else {
          this.logger.log(`📡 Downloading raw master resource from: ${asset.rawUrl}`)
          const response = await axios.get(asset.rawUrl, {
            responseType: 'arraybuffer',
            timeout: 15000,
          })
          rawBuffer = Buffer.from(response.data)
          await this.storage.saveOriginal(assetId, rawBuffer)
        }
      }

      // Update original file path on the asset record
      await this.prisma.mediaAsset.update({
        where: { id: assetId },
        data: { localOriginalPath: this.storage.getOriginalPhysicalPath(assetId) },
      })

      // 3. Extract BlurHash & Base64 placeholder values
      const { blurhashString, tinyBase64Url } = await this.placeholders.generatePlaceholders(rawBuffer)

      // 4. Resolve visual roles to generate
      const targetRoles: MediaRole[] = []
      if (asset.coverGames.length > 0) {
        targetRoles.push(MediaRole.COVER_SM, MediaRole.COVER_MD, MediaRole.COVER_LG, MediaRole.THUMBNAIL_BLUR)
      }
      if (asset.backdropGames.length > 0) {
        targetRoles.push(MediaRole.BACKDROP_HERO, MediaRole.THUMBNAIL_BLUR)
      }
      if (asset.screenshots.length > 0) {
        targetRoles.push(MediaRole.GALLERY_HD)
      }
      if (targetRoles.length === 0) {
        // Default to cover sizing if orphans
        targetRoles.push(MediaRole.COVER_MD)
      }

      // Deduplicate roles (e.g. THUMBNAIL_BLUR might be pushed twice)
      const uniqueRoles = Array.from(new Set(targetRoles))

      // 5. Generate and persist optimized variants (formats: WebP and AVIF) under strict Sharp semaphores
      await this.sharpSemaphore.acquire()

      try {
        for (const role of uniqueRoles) {
          for (const format of ['webp', 'avif'] as const) {
            this.logger.debug(`🎨 Transforming variant: [${role} | ${format}]`)
            
            const { data: variantBuffer, width, height } = await this.generator.generateVariant(
              rawBuffer,
              role,
              format
            )

            // Save optimized variant binary to disk
            const publicUrl = await this.storage.saveVariant(assetId, role, format, variantBuffer)

            // Store canonical MediaVariant manifest record in the database
            await this.prisma.mediaVariant.upsert({
              where: {
                assetId_role_format: {
                  assetId,
                  role,
                  format,
                },
              },
              update: {
                url: publicUrl,
                width,
                height,
                blurPlaceholder: tinyBase64Url, // Base64 blur loading image
              },
              create: {
                assetId,
                role,
                format,
                url: publicUrl,
                width,
                height,
                blurPlaceholder: tinyBase64Url,
              },
            })
          }
        }
      } finally {
        this.sharpSemaphore.release()
      }

      const durationMs = Date.now() - startTime

      // 6. Complete lifecycle successfully: Transition state to READY and write metadata metrics
      await this.prisma.mediaAsset.update({
        where: { id: assetId },
        data: {
          processingState: MediaProcessingState.READY,
          optimized: true,
          transformationFingerprint: this.settingsFingerprint,
          processingDurationMs: durationMs,
          lastFailureReason: null,
          lastProcessedAt: new Date(),
        },
      })

      this.logger.log(`✅ MediaAsset ${assetId} fully optimized in ${durationMs}ms (State: READY)`)

    } catch (err: any) {
      const durationMs = Date.now() - startTime
      const failReason = err.message || 'Unknown media transformation failure'
      this.logger.error(`❌ Media transformation failed for asset ${assetId}: ${failReason}`)

      const currentRetry = asset.retryCount + 1
      const nextState = currentRetry >= 3 ? MediaProcessingState.FAILED : MediaProcessingState.PENDING

      await this.prisma.mediaAsset.update({
        where: { id: assetId },
        data: {
          processingState: nextState,
          retryCount: currentRetry,
          lastFailureReason: failReason,
          processingDurationMs: durationMs,
          lastProcessedAt: new Date(),
        },
      })

      this.logger.warn(
        `⚠️ Asset ${assetId} moved to state [${nextState}] (Retry: ${currentRetry}/3)`
      )
    }
  }
}
