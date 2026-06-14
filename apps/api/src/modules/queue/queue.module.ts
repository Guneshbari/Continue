import type { OnModuleInit} from '@nestjs/common';
import { Module, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { BullModule, InjectQueue } from '@nestjs/bullmq'
import type { Queue } from 'bullmq'
import { FastifyAdapter } from '@bull-board/fastify'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { MediaModule } from '../media/media.module'
import {
  GAME_SYNC_QUEUE,
  MEDIA_PROCESSING_QUEUE,
  MAINTENANCE_QUEUE,
  DEAD_LETTER_QUEUE,
} from './queue.constants'
import { MaintenanceWorker } from './workers/maintenance.worker'

@Module({
  imports: [
    PrismaModule,
    MediaModule,
    // 1. Configure central BullModule with Redis connection string from ConfigService
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') || 'redis://localhost:6379'
        return {
          connection: {
            url: redisUrl,
          },
          defaultJobOptions: {
            removeOnComplete: 100, // keep last 100 successful jobs
            removeOnFail: 500,     // keep last 500 failed jobs (non-permanently failed)
          },
        }
      },
    }),
    // 2. Register all four system queues
    BullModule.registerQueue(
      { name: GAME_SYNC_QUEUE },
      { name: MEDIA_PROCESSING_QUEUE },
      { name: MAINTENANCE_QUEUE },
      { name: DEAD_LETTER_QUEUE }
    ),
  ],
  providers: [MaintenanceWorker],
  exports: [BullModule],
})
export class QueueModule implements OnModuleInit {
  private readonly logger = new Logger(QueueModule.name)

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @InjectQueue(GAME_SYNC_QUEUE) private readonly gameSyncQueue: Queue,
    @InjectQueue(MEDIA_PROCESSING_QUEUE) private readonly mediaQueue: Queue,
    @InjectQueue(MAINTENANCE_QUEUE) private readonly maintenanceQueue: Queue,
    @InjectQueue(DEAD_LETTER_QUEUE) private readonly deadLetterQueue: Queue
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Initializing Background Workers & Scheduling Module...')

    // 1. Mount Bull Board UI Fastify Adapter
    try {
      const httpAdapter = this.adapterHost.httpAdapter
      const fastifyInstance = httpAdapter.getInstance()

      const serverAdapter = new FastifyAdapter()
      serverAdapter.setBasePath('/admin/queues')

      createBullBoard({
        queues: [
          new BullMQAdapter(this.gameSyncQueue),
          new BullMQAdapter(this.mediaQueue),
          new BullMQAdapter(this.maintenanceQueue),
          new BullMQAdapter(this.deadLetterQueue),
        ],
        serverAdapter,
      })

      fastifyInstance.register(serverAdapter.registerPlugin(), {
        prefix: '/admin/queues',
      })
      this.logger.log('📊 Bull Board dashboard mounted successfully at: /admin/queues')
    } catch (boardErr: any) {
      this.logger.error(`❌ Failed to mount Bull Board dashboard: ${boardErr.message}`)
    }

    // 2. Schedule repeatable tasks on Maintenance Queue
    try {
      // Clear old repeatable jobs to prevent duplicates if rules change
      const repeatableJobs = await this.maintenanceQueue.getRepeatableJobs()
      for (const job of repeatableJobs) {
        await this.maintenanceQueue.removeRepeatableByKey(job.key)
      }

      // Schedule syncPopularGames every 24 hours at midnight
      await this.maintenanceQueue.add(
        'syncPopularGames',
        { limit: 20 },
        {
          repeat: { pattern: '0 0 * * *' },
          jobId: 'sync-popular-games-repeat',
        }
      )

      // Schedule refreshStaleMetadata every Sunday at 2 AM
      await this.maintenanceQueue.add(
        'refreshStaleMetadata',
        { staleOlderThanDays: 7 },
        {
          repeat: { pattern: '0 2 * * 0' },
          jobId: 'refresh-stale-metadata-repeat',
        }
      )

      // Schedule cleanupFailedMedia every Sunday at 3 AM
      await this.maintenanceQueue.add(
        'cleanupFailedMedia',
        {},
        {
          repeat: { pattern: '0 3 * * 0' },
          jobId: 'cleanup-failed-media-repeat',
        }
      )

      // Schedule verifyMediaIntegrity every day at 4 AM
      await this.maintenanceQueue.add(
        'verifyMediaIntegrity',
        {},
        {
          repeat: { pattern: '0 4 * * *' },
          jobId: 'verify-media-integrity-repeat',
        }
      )

      this.logger.log('📅 Repeatable cron tasks scheduled successfully on the maintenance queue.')
    } catch (cronErr: any) {
      this.logger.error(`❌ Failed to register repeatable crons: ${cronErr.message}`)
    }
  }
}
