import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { HealthController } from './health.controller'
import { PrismaService } from '../../common/prisma/prisma.service'
import {
  GAME_SYNC_QUEUE,
  MEDIA_PROCESSING_QUEUE,
  MAINTENANCE_QUEUE,
  DEAD_LETTER_QUEUE,
} from '../queue/queue.constants'

describe('HealthController', () => {
  let controller: HealthController
  let prisma: jest.Mocked<PrismaService>
  let mockGameSyncQueue: any
  let mockMediaQueue: any
  let mockMaintenanceQueue: any
  let mockDeadLetterQueue: any

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    } as any

    mockGameSyncQueue = {
      getJobCounts: jest
        .fn()
        .mockResolvedValue({ active: 1, waiting: 2, completed: 3, failed: 0, delayed: 0 }),
    }
    mockMediaQueue = {
      getJobCounts: jest
        .fn()
        .mockResolvedValue({ active: 0, waiting: 0, completed: 10, failed: 1, delayed: 0 }),
    }
    mockMaintenanceQueue = {
      getJobCounts: jest
        .fn()
        .mockResolvedValue({ active: 0, waiting: 1, completed: 5, failed: 0, delayed: 0 }),
    }
    mockDeadLetterQueue = {
      getJobCounts: jest
        .fn()
        .mockResolvedValue({ active: 0, waiting: 0, completed: 0, failed: 0, delayed: 0 }),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: getQueueToken(GAME_SYNC_QUEUE), useValue: mockGameSyncQueue },
        { provide: getQueueToken(MEDIA_PROCESSING_QUEUE), useValue: mockMediaQueue },
        { provide: getQueueToken(MAINTENANCE_QUEUE), useValue: mockMaintenanceQueue },
        { provide: getQueueToken(DEAD_LETTER_QUEUE), useValue: mockDeadLetterQueue },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('check', () => {
    it('should return 200 with process health info', () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any

      controller.check(mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          uptime: expect.any(Number),
          memory: expect.any(Object),
        }),
      )
    })
  })

  describe('ready', () => {
    it('should return 200 OK when DB is healthy', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any

      prisma.$queryRaw.mockResolvedValue([1] as any)

      await controller.ready(mockRes)

      expect(prisma.$queryRaw).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          details: expect.objectContaining({
            database: { status: 'healthy', error: null },
          }),
        }),
      )
    })

    it('should return 503 UNREADY when DB query fails', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any

      prisma.$queryRaw.mockRejectedValue(new Error('Connection failure'))

      await controller.ready(mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(503)
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UNREADY',
          details: expect.objectContaining({
            database: { status: 'unhealthy', error: 'Connection failure' },
          }),
        }),
      )
    })
  })

  describe('queues', () => {
    it('should return 200 with queue job counts', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any

      await controller.queueHealth(mockRes)

      expect(mockGameSyncQueue.getJobCounts).toHaveBeenCalled()
      expect(mockMediaQueue.getJobCounts).toHaveBeenCalled()
      expect(mockMaintenanceQueue.getJobCounts).toHaveBeenCalled()
      expect(mockDeadLetterQueue.getJobCounts).toHaveBeenCalled()

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          queues: expect.objectContaining({
            [GAME_SYNC_QUEUE]: { active: 1, waiting: 2, completed: 3, failed: 0, delayed: 0 },
            [MEDIA_PROCESSING_QUEUE]: {
              active: 0,
              waiting: 0,
              completed: 10,
              failed: 1,
              delayed: 0,
            },
          }),
        }),
      )
    })

    it('should return 500 UNHEALTHY if fetching counts fails', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any

      mockGameSyncQueue.getJobCounts.mockRejectedValue(new Error('Redis Unavailable'))

      await controller.queueHealth(mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UNHEALTHY',
          error: 'Redis Unavailable',
        }),
      )
    })

    it('should return 200 with backpressure status warning when backlog is high', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any

      mockGameSyncQueue.getJobCounts.mockResolvedValue({
        active: 1,
        waiting: 1500,
        completed: 3,
        failed: 0,
        delayed: 0,
      })

      await controller.queueHealth(mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OK',
          backpressureStatus: 'warning',
          warnings: expect.arrayContaining([
            expect.stringContaining('Game sync queue backlog is high'),
          ]),
        }),
      )
    })

    it('should return 503 with backpressure status critical when backlog is critical', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any

      mockGameSyncQueue.getJobCounts.mockResolvedValue({
        active: 1,
        waiting: 2500,
        completed: 3,
        failed: 0,
        delayed: 0,
      })

      await controller.queueHealth(mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(503)
      expect(mockRes.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'UNHEALTHY',
          backpressureStatus: 'critical',
          warnings: expect.arrayContaining([
            expect.stringContaining('Game sync queue backlog is critical'),
          ]),
        }),
      )
    })
  })
})
