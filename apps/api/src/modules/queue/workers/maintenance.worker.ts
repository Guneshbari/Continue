import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq'
import { Job, Queue } from 'bullmq'
import { Logger } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { MediaStorageService } from '../../media/services/media-storage.service'
import {
  MAINTENANCE_QUEUE,
  GAME_SYNC_QUEUE,
  MEDIA_PROCESSING_QUEUE,
  SYNC_POPULAR_GAMES_JOB,
  SYNC_GAME_JOB,
  PROCESS_MEDIA_JOB,
} from '../queue.constants'

@Processor(MAINTENANCE_QUEUE)
export class MaintenanceWorker extends WorkerHost {
  private readonly logger = new Logger(MaintenanceWorker.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: MediaStorageService,
    @InjectQueue(GAME_SYNC_QUEUE) private readonly gameSyncQueue: Queue,
    @InjectQueue(MEDIA_PROCESSING_QUEUE) private readonly mediaQueue: Queue,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`📥 Starting maintenance job: [${job.name}] | Job ID: ${job.id}`)

    switch (job.name) {
      case 'syncPopularGames': {
        const limit = job.data.limit || 20
        this.logger.log(`⏰ Scheduled Task: Delegating popular games sync (Limit: ${limit})`)
        await this.gameSyncQueue.add(
          SYNC_POPULAR_GAMES_JOB,
          { limit },
          {
            jobId: `sync-popular-games:${new Date().toISOString().split('T')[0]}`, // daily idempotency
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          },
        )
        return { status: 'delegated', limit }
      }

      case 'refreshStaleMetadata': {
        this.logger.log('⏰ Scheduled Task: Checking for stale game metadata')
        const days = job.data.staleOlderThanDays || 7
        const threshold = new Date()
        threshold.setDate(threshold.getDate() - days)

        // Find games that have not been updated since the threshold
        const staleGames = await this.prisma.game.findMany({
          where: {
            updatedAt: { lt: threshold },
            deletedAt: null,
          },
          select: { slug: true, id: true },
        })

        this.logger.log(`Found ${staleGames.length} stale games. Enqueueing sync jobs...`)
        for (const game of staleGames) {
          await this.gameSyncQueue.add(
            SYNC_GAME_JOB,
            { slug: game.slug },
            {
              jobId: `game-sync:stale:${game.slug}`, // prevent duplicate active syncs
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
            },
          )
        }
        return { status: 'enqueued', count: staleGames.length }
      }

      case 'cleanupFailedMedia': {
        this.logger.log('⏰ Scheduled Task: Retrying failed media assets')
        // Retries failed processing attempts that have not exceeded the standard limit
        const failedAssets = await this.prisma.mediaAsset.findMany({
          where: {
            processingState: 'FAILED',
            retryCount: { lt: 3 },
          },
          select: { id: true },
        })

        this.logger.log(
          `Found ${failedAssets.length} failed media assets with retries left. Re-enqueueing...`,
        )
        for (const asset of failedAssets) {
          await this.mediaQueue.add(
            PROCESS_MEDIA_JOB,
            { assetId: asset.id },
            {
              jobId: `media:retry:${asset.id}`,
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
            },
          )
        }
        return { status: 'retried', count: failedAssets.length }
      }

      case 'verifyMediaIntegrity': {
        this.logger.log('⏰ Scheduled Task: Verifying disk files integrity')
        // Get all READY assets and check if physical files still exist
        const assets = await this.prisma.mediaAsset.findMany({
          where: { processingState: 'READY' },
          select: { id: true, rawUrl: true },
        })

        let integrityBreaches = 0
        this.logger.log(`Verifying disk integrity for ${assets.length} READY media assets...`)

        for (const asset of assets) {
          const exists = await this.storage.originalExists(asset.id)
          if (!exists) {
            this.logger.warn(
              `⚠️ Media Asset ${asset.id} file is missing from disk! Re-enqueueing for processing.`,
            )
            integrityBreaches++

            // Reset asset to PENDING in database
            await this.prisma.mediaAsset.update({
              where: { id: asset.id },
              data: { processingState: 'PENDING', optimized: false },
            })

            // Re-enqueue
            await this.mediaQueue.add(
              PROCESS_MEDIA_JOB,
              { assetId: asset.id },
              {
                jobId: `media:integrity-reset:${asset.id}`,
                attempts: 3,
                backoff: { type: 'exponential', delay: 5000 },
              },
            )
          }
        }

        this.logger.log(
          `Disk integrity checks completed. Breaches detected & enqueued: ${integrityBreaches}`,
        )
        return {
          status: 'checked',
          totalChecked: assets.length,
          breachesDetected: integrityBreaches,
        }
      }

      default:
        throw new Error(`Unsupported maintenance job type: ${job.name}`)
    }
  }
}
