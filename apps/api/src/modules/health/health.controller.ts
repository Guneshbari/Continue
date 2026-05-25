import { Controller, Get, Res } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../../common/prisma/prisma.service'
import { Public } from '../auth/decorators/public.decorator'
import type { FastifyReply } from 'fastify'

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check(@Res() res: FastifyReply) {
    let dbStatus = 'healthy'
    let dbError: string | null = null

    try {
      await this.prisma.$queryRaw`SELECT 1`
    } catch (err) {
      dbStatus = 'unhealthy'
      dbError = err instanceof Error ? err.message : String(err)
    }

    const payload = {
      status: dbStatus === 'healthy' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
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
}
