import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq'
import { Job, Queue } from 'bullmq'
import { Logger } from '@nestjs/common'
import { MediaProcessingService } from '../../media/services/media-processing.service'
import {
  MEDIA_PROCESSING_QUEUE,
  DEAD_LETTER_QUEUE,
  PROCESS_MEDIA_JOB,
} from '../queue.constants'
import { ProcessMediaPayload } from '../queue.types'

@Processor(MEDIA_PROCESSING_QUEUE)
export class MediaProcessingWorker extends WorkerHost {
  private readonly logger = new Logger(MediaProcessingWorker.name)

  constructor(
    private readonly mediaProcessor: MediaProcessingService,
    @InjectQueue(DEAD_LETTER_QUEUE) private readonly deadLetterQueue: Queue
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const startTime = Date.now()
    this.logger.log(`📥 Starting media-processing job: [${job.name}] | Job ID: ${job.id} | Attempt: ${job.attemptsMade + 1}`)

    try {
      switch (job.name) {
        case PROCESS_MEDIA_JOB: {
          const { assetId } = job.data as ProcessMediaPayload
          if (!assetId) {
            throw new Error('ProcessMediaJob payload requires a valid assetId.')
          }

          this.logger.log(`🎨 Processing media asset ID: ${assetId}`)
          return await this.mediaProcessor.processAsset(assetId)
        }

        default:
          throw new Error(`Unsupported job name for media-processing queue: ${job.name}`)
      }
    } catch (err: any) {
      const duration = Date.now() - startTime
      this.logger.error(`❌ Media job ${job.id} failed after ${duration}ms: ${err.message}`)

      // Intercept permanent failures to store in Dead Letter Queue (DLQ)
      const maxAttempts = job.opts.attempts || 3
      if (job.attemptsMade + 1 >= maxAttempts) {
        this.logger.warn(`⚠️ Media job ${job.id} permanently failed. Enqueueing to Dead Letter Queue (DLQ).`)
        try {
          await this.deadLetterQueue.add(
            'FailedJob',
            {
              originalQueue: MEDIA_PROCESSING_QUEUE,
              jobName: job.name,
              payload: job.data,
              errorMessage: err.stack || err.message,
              failedAt: new Date().toISOString(),
              attemptsMade: job.attemptsMade + 1,
            },
            {
              jobId: `dlq:media-processing:${job.id}`, // ensure idempotency in the DLQ itself
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
