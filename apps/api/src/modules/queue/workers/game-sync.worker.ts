import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq'
import type { Job, Queue } from 'bullmq'
import { Logger } from '@nestjs/common'
import { ProviderSyncService } from '../../ingestion/services/provider-sync.service'
import {
  GAME_SYNC_QUEUE,
  DEAD_LETTER_QUEUE,
  SYNC_GAME_JOB,
  SYNC_POPULAR_GAMES_JOB,
} from '../queue.constants'
import type { SyncGamePayload, SyncPopularGamesPayload } from '../queue.types'

@Processor(GAME_SYNC_QUEUE)
export class GameSyncWorker extends WorkerHost {
  private readonly logger = new Logger(GameSyncWorker.name)

  constructor(
    private readonly providerSync: ProviderSyncService,
    @InjectQueue(DEAD_LETTER_QUEUE) private readonly deadLetterQueue: Queue
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const startTime = Date.now()
    this.logger.log(`📥 Starting game-sync job: [${job.name}] | Job ID: ${job.id} | Attempt: ${job.attemptsMade + 1}`)

    try {
      switch (job.name) {
        case SYNC_GAME_JOB: {
          const { slug, gameId } = job.data as SyncGamePayload
          if (!slug && !gameId) {
            throw new Error('SyncGameJob payload requires at least a slug or gameId.')
          }

          if (slug) {
            this.logger.log(`🎮 [CorrelationID: ${job.id}] Syncing game by slug: "${slug}"`)
            return await this.providerSync.syncGameBySlug(slug, job.id)
          } else {
            this.logger.log(`🎮 [CorrelationID: ${job.id}] Syncing game by external ID: ${gameId}`)
            return await this.providerSync.syncGameByExternalId(Number(gameId), job.id)
          }
        }

        case SYNC_POPULAR_GAMES_JOB: {
          const { limit } = job.data as SyncPopularGamesPayload
          const finalLimit = limit || 10
          this.logger.log(`🔥 [CorrelationID: ${job.id}] Syncing popular games (Limit: ${finalLimit})`)
          return await this.providerSync.syncPopularGames(finalLimit, job.id)
        }

        default:
          throw new Error(`Unsupported job name for game-sync queue: ${job.name}`)
      }
    } catch (err: any) {
      const duration = Date.now() - startTime
      this.logger.error(`❌ Job ${job.id} failed after ${duration}ms: ${err.message}`)

      // Intercept permanent failures to store in Dead Letter Queue (DLQ)
      const maxAttempts = job.opts.attempts || 3
      if (job.attemptsMade + 1 >= maxAttempts) {
        this.logger.warn(`⚠️ Job ${job.id} permanently failed. Enqueueing to Dead Letter Queue (DLQ).`)
        try {
          await this.deadLetterQueue.add(
            'FailedJob',
            {
              originalQueue: GAME_SYNC_QUEUE,
              jobName: job.name,
              payload: job.data,
              errorMessage: err.stack || err.message,
              failedAt: new Date().toISOString(),
              attemptsMade: job.attemptsMade + 1,
            },
            {
              jobId: `dlq:game-sync:${job.id}`, // ensure idempotency in the DLQ itself
            }
          )
        } catch (dlqErr: any) {
          this.logger.error(`❌ Failed to route job ${job.id} to Dead Letter Queue: ${dlqErr.message}`)
        }
      }

      throw err
    }
  }
}
