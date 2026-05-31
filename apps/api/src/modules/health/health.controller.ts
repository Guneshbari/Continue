import { Controller, Get, Res } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../../common/prisma/prisma.service'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'
import {
  GAME_SYNC_QUEUE,
  MEDIA_PROCESSING_QUEUE,
  MAINTENANCE_QUEUE,
  DEAD_LETTER_QUEUE,
} from '../queue/queue.constants'

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(GAME_SYNC_QUEUE) private readonly gameSyncQueue: Queue,
    @InjectQueue(MEDIA_PROCESSING_QUEUE) private readonly mediaQueue: Queue,
    @InjectQueue(MAINTENANCE_QUEUE) private readonly maintenanceQueue: Queue,
    @InjectQueue(DEAD_LETTER_QUEUE) private readonly deadLetterQueue: Queue
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness check (lightweight, process only)' })
  check(@Res() res: FastifyReply) {
    const payload = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }
    return res.status(200).send(payload)
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (database connectivity)' })
  async ready(@Res() res: FastifyReply) {
    let dbStatus = 'healthy'
    let dbError: string | null = null

    try {
      await this.prisma.$queryRaw`SELECT 1`
    } catch (err) {
      dbStatus = 'unhealthy'
      dbError = err instanceof Error ? err.message : String(err)
    }

    const payload = {
      status: dbStatus === 'healthy' ? 'OK' : 'UNREADY',
      timestamp: new Date().toISOString(),
      details: {
        database: {
          status: dbStatus,
          error: dbError,
        },
      },
    }

    const statusCode = dbStatus === 'healthy' ? 200 : 503
    return res.status(statusCode).send(payload)
  }

  @Public()
  @Get('queues')
  @ApiOperation({ summary: 'Queue health statistics' })
  async queueHealth(@Res() res: FastifyReply) {
    try {
      const [gameSyncCounts, mediaCounts, maintenanceCounts, deadLetterCounts] = await Promise.all([
        this.gameSyncQueue.getJobCounts(),
        this.mediaQueue.getJobCounts(),
        this.maintenanceQueue.getJobCounts(),
        this.deadLetterQueue.getJobCounts(),
      ])

      const payload = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        queues: {
          [GAME_SYNC_QUEUE]: gameSyncCounts,
          [MEDIA_PROCESSING_QUEUE]: mediaCounts,
          [MAINTENANCE_QUEUE]: maintenanceCounts,
          [DEAD_LETTER_QUEUE]: deadLetterCounts,
        },
      }

      return res.status(200).send(payload)
    } catch (err: any) {
      const payload = {
        status: 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        error: err.message,
      }
      return res.status(500).send(payload)
    }
  }
}

