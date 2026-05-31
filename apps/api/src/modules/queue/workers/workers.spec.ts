import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import type { Job, Queue } from 'bullmq'
import { GameSyncWorker } from './game-sync.worker'
import { MediaProcessingWorker } from './media-processing.worker'
import { MaintenanceWorker } from './maintenance.worker'
import { ProviderSyncService } from '../../ingestion/services/provider-sync.service'
import { MediaProcessingService } from '../../media/services/media-processing.service'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { MediaStorageService } from '../../media/services/media-storage.service'
import {
  GAME_SYNC_QUEUE,
  MEDIA_PROCESSING_QUEUE,
  DEAD_LETTER_QUEUE,
  SYNC_GAME_JOB,
  SYNC_POPULAR_GAMES_JOB,
  PROCESS_MEDIA_JOB,
} from '../queue.constants'

describe('Queue Workers & Processors', () => {
  let gameSyncWorker: GameSyncWorker
  let mediaProcessingWorker: MediaProcessingWorker
  let maintenanceWorker: MaintenanceWorker

  let providerSyncService: jest.Mocked<ProviderSyncService>
  let mediaProcessingService: jest.Mocked<MediaProcessingService>
  let prismaService: any
  let mediaStorageService: jest.Mocked<MediaStorageService>

  let mockGameSyncQueue: jest.Mocked<Queue>
  let mockMediaQueue: jest.Mocked<Queue>
  let mockDeadLetterQueue: jest.Mocked<Queue>

  beforeEach(async () => {
    // Mocks for Services
    const mockProviderSync = {
      syncGameBySlug: jest.fn(),
      syncGameByExternalId: jest.fn(),
      syncPopularGames: jest.fn(),
    }

    const mockMediaProcessor = {
      processAsset: jest.fn(),
    }

    const mockPrisma = {
      game: {
        findMany: jest.fn(),
      },
      mediaAsset: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    }

    const mockStorage = {
      originalExists: jest.fn(),
    }

    // Mocks for Queues
    mockGameSyncQueue = { add: jest.fn() } as any
    mockMediaQueue = { add: jest.fn() } as any
    mockDeadLetterQueue = { add: jest.fn() } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameSyncWorker,
        MediaProcessingWorker,
        MaintenanceWorker,
        { provide: ProviderSyncService, useValue: mockProviderSync },
        { provide: MediaProcessingService, useValue: mockMediaProcessor },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MediaStorageService, useValue: mockStorage },
        { provide: getQueueToken(GAME_SYNC_QUEUE), useValue: mockGameSyncQueue },
        { provide: getQueueToken(MEDIA_PROCESSING_QUEUE), useValue: mockMediaQueue },
        { provide: getQueueToken(DEAD_LETTER_QUEUE), useValue: mockDeadLetterQueue },
      ],
    }).compile()

    gameSyncWorker = module.get<GameSyncWorker>(GameSyncWorker)
    mediaProcessingWorker = module.get<MediaProcessingWorker>(MediaProcessingWorker)
    maintenanceWorker = module.get<MaintenanceWorker>(MaintenanceWorker)

    providerSyncService = module.get(ProviderSyncService) as any
    mediaProcessingService = module.get(MediaProcessingService) as any
    prismaService = module.get(PrismaService) as any
    mediaStorageService = module.get(MediaStorageService) as any
  })

  describe('GameSyncWorker', () => {
    it('should be defined', () => {
      expect(gameSyncWorker).toBeDefined()
    })

    it('should process SYNC_GAME_JOB with slug', async () => {
      const job = {
        id: 'job-slug-1',
        name: SYNC_GAME_JOB,
        data: { slug: 'test-game' },
        attemptsMade: 0,
        opts: { attempts: 3 },
      } as Job

      providerSyncService.syncGameBySlug.mockResolvedValue({ id: 'game-1' } as any)

      const result = await gameSyncWorker.process(job)
      expect(providerSyncService.syncGameBySlug).toHaveBeenCalledWith('test-game', 'job-slug-1')
      expect(result).toEqual({ id: 'game-1' })
    })

    it('should process SYNC_GAME_JOB with gameId', async () => {
      const job = {
        id: 'job-game-2',
        name: SYNC_GAME_JOB,
        data: { gameId: '123' },
        attemptsMade: 0,
        opts: { attempts: 3 },
      } as Job

      providerSyncService.syncGameByExternalId.mockResolvedValue({ id: 'game-2' } as any)

      const result = await gameSyncWorker.process(job)
      expect(providerSyncService.syncGameByExternalId).toHaveBeenCalledWith(123, 'job-game-2')
      expect(result).toEqual({ id: 'game-2' })
    })

    it('should process SYNC_POPULAR_GAMES_JOB', async () => {
      const job = {
        id: 'job-popular-3',
        name: SYNC_POPULAR_GAMES_JOB,
        data: { limit: 15 },
        attemptsMade: 0,
        opts: { attempts: 3 },
      } as Job

      providerSyncService.syncPopularGames.mockResolvedValue([{ id: 'game-1' }] as any)

      const result = await gameSyncWorker.process(job)
      expect(providerSyncService.syncPopularGames).toHaveBeenCalledWith(15, 'job-popular-3')
      expect(result).toEqual([{ id: 'game-1' }])
    })

    it('should route permanently failed jobs to DLQ', async () => {
      const job = {
        id: 'failed-job-1',
        name: SYNC_GAME_JOB,
        data: { slug: 'failed-game' },
        attemptsMade: 2, // 3rd attempt failing (0-indexed attemptsMade)
        opts: { attempts: 3 },
      } as Job

      const error = new Error('API Timeout')
      providerSyncService.syncGameBySlug.mockRejectedValue(error)

      await expect(gameSyncWorker.process(job)).rejects.toThrow('API Timeout')

      expect(mockDeadLetterQueue.add).toHaveBeenCalledWith(
        'FailedJob',
        expect.objectContaining({
          originalQueue: GAME_SYNC_QUEUE,
          jobName: SYNC_GAME_JOB,
          payload: { slug: 'failed-game' },
          errorMessage: expect.stringContaining('API Timeout'),
          attemptsMade: 3,
        }),
        expect.objectContaining({
          jobId: 'dlq:game-sync:failed-job-1',
        })
      )
    })

    it('should NOT route to DLQ if attempts are not exhausted', async () => {
      const job = {
        id: 'failed-job-2',
        name: SYNC_GAME_JOB,
        data: { slug: 'failed-game' },
        attemptsMade: 1, // 2nd attempt failing (attemptsMade = 1 < attempts = 3)
        opts: { attempts: 3 },
      } as Job

      const error = new Error('API Timeout')
      providerSyncService.syncGameBySlug.mockRejectedValue(error)

      await expect(gameSyncWorker.process(job)).rejects.toThrow('API Timeout')

      expect(mockDeadLetterQueue.add).not.toHaveBeenCalled()
    })
  })

  describe('MediaProcessingWorker', () => {
    it('should be defined', () => {
      expect(mediaProcessingWorker).toBeDefined()
    })

    it('should process PROCESS_MEDIA_JOB', async () => {
      const job = {
        name: PROCESS_MEDIA_JOB,
        data: { assetId: 'asset-1' },
        attemptsMade: 0,
        opts: { attempts: 3 },
      } as Job

      mediaProcessingService.processAsset.mockResolvedValue({ success: true } as any)

      const result = await mediaProcessingWorker.process(job)
      expect(mediaProcessingService.processAsset).toHaveBeenCalledWith('asset-1')
      expect(result).toEqual({ success: true })
    })

    it('should route permanently failed media jobs to DLQ', async () => {
      const job = {
        id: 'failed-media-1',
        name: PROCESS_MEDIA_JOB,
        data: { assetId: 'asset-fail' },
        attemptsMade: 2,
        opts: { attempts: 3 },
      } as Job

      const error = new Error('Sharp processing error')
      mediaProcessingService.processAsset.mockRejectedValue(error)

      await expect(mediaProcessingWorker.process(job)).rejects.toThrow('Sharp processing error')

      expect(mockDeadLetterQueue.add).toHaveBeenCalledWith(
        'FailedJob',
        expect.objectContaining({
          originalQueue: MEDIA_PROCESSING_QUEUE,
          jobName: PROCESS_MEDIA_JOB,
          payload: { assetId: 'asset-fail' },
          errorMessage: expect.stringContaining('Sharp processing error'),
          attemptsMade: 3,
        }),
        expect.objectContaining({
          jobId: 'dlq:media-processing:failed-media-1',
        })
      )
    })
  })

  describe('MaintenanceWorker', () => {
    it('should be defined', () => {
      expect(maintenanceWorker).toBeDefined()
    })

    it('should handle syncPopularGames job', async () => {
      const job = {
        name: 'syncPopularGames',
        data: { limit: 20 },
      } as Job

      const result = await maintenanceWorker.process(job)

      expect(mockGameSyncQueue.add).toHaveBeenCalledWith(
        SYNC_POPULAR_GAMES_JOB,
        { limit: 20 },
        expect.objectContaining({
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        })
      )
      expect(result).toEqual({ status: 'delegated', limit: 20 })
    })

    it('should handle refreshStaleMetadata job', async () => {
      const job = {
        name: 'refreshStaleMetadata',
        data: { staleOlderThanDays: 5 },
      } as Job

      prismaService.game.findMany.mockResolvedValue([
        { id: '1', slug: 'game-a' },
        { id: '2', slug: 'game-b' },
      ] as any)

      const result = await maintenanceWorker.process(job)

      expect(prismaService.game.findMany).toHaveBeenCalled()
      expect(mockGameSyncQueue.add).toHaveBeenCalledTimes(2)
      expect(mockGameSyncQueue.add).toHaveBeenCalledWith(
        SYNC_GAME_JOB,
        { slug: 'game-a' },
        expect.objectContaining({
          jobId: 'game-sync:stale:game-a',
        })
      )
      expect(result).toEqual({ status: 'enqueued', count: 2 })
    })

    it('should handle cleanupFailedMedia job', async () => {
      const job = {
        name: 'cleanupFailedMedia',
        data: {},
      } as Job

      prismaService.mediaAsset.findMany.mockResolvedValue([
        { id: 'asset-1' },
      ] as any)

      const result = await maintenanceWorker.process(job)

      expect(prismaService.mediaAsset.findMany).toHaveBeenCalled()
      expect(mockMediaQueue.add).toHaveBeenCalledWith(
        PROCESS_MEDIA_JOB,
        { assetId: 'asset-1' },
        expect.objectContaining({
          jobId: 'media:retry:asset-1',
        })
      )
      expect(result).toEqual({ status: 'retried', count: 1 })
    })

    it('should handle verifyMediaIntegrity and detect breaches', async () => {
      const job = {
        name: 'verifyMediaIntegrity',
        data: {},
      } as Job

      prismaService.mediaAsset.findMany.mockResolvedValue([
        { id: 'asset-ok', rawUrl: 'http://ok' },
        { id: 'asset-missing', rawUrl: 'http://missing' },
      ] as any)

      mediaStorageService.originalExists.mockImplementation(async (id) => id === 'asset-ok')

      const result = await maintenanceWorker.process(job)

      expect(mediaStorageService.originalExists).toHaveBeenCalledTimes(2)
      expect(prismaService.mediaAsset.update).toHaveBeenCalledWith({
        where: { id: 'asset-missing' },
        data: { processingState: 'PENDING', optimized: false },
      })
      expect(mockMediaQueue.add).toHaveBeenCalledWith(
        PROCESS_MEDIA_JOB,
        { assetId: 'asset-missing' },
        expect.objectContaining({
          jobId: 'media:integrity-reset:asset-missing',
        })
      )
      expect(result).toEqual({
        status: 'checked',
        totalChecked: 2,
        breachesDetected: 1,
      })
    })
  })
})
