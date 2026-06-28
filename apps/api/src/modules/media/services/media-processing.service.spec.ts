import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { MediaProcessingService } from './media-processing.service'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { MediaStorageService } from './media-storage.service'
import { BlurPlaceholderService } from './blur-placeholder.service'
import { VariantGeneratorService } from './variant-generator.service'
import { ConfigService } from '@nestjs/config'
import { MediaProcessingState } from '@prisma/client'

// Mock sharp.stats() and sharp.toBuffer()
jest.mock('sharp', () => {
  const mSharp: any = jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    keepMetadata: jest.fn().mockReturnThis(),
    avif: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue({
      data: Buffer.from('mock-buffer'),
      info: { width: 1920, height: 1080 },
    }),
    stats: jest.fn().mockResolvedValue({
      channels: [
        { mean: 120, stdev: 45 }, // Red
        { mean: 100, stdev: 40 }, // Green
        { mean: 80, stdev: 35 }, // Blue
      ],
    }),
  }))
  mSharp.cache = jest.fn()
  return mSharp
})

describe('MediaProcessingService', () => {
  let service: MediaProcessingService
  let prisma: any
  let storage: jest.Mocked<MediaStorageService>

  beforeEach(async () => {
    const mockPrisma = {
      mediaAsset: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      mediaVariant: {
        upsert: jest.fn(),
      },
      screenshot: {
        updateMany: jest.fn(),
        findMany: jest.fn(),
      },
    }

    const mockStorage = {
      originalExists: jest.fn(),
      readOriginal: jest.fn(),
      saveOriginal: jest.fn(),
      getOriginalPhysicalPath: jest.fn().mockReturnValue('/mock/path/original.bin'),
      saveVariant: jest.fn().mockResolvedValue('/public/mock-url.webp'),
    }

    const mockPlaceholders = {
      generatePlaceholders: jest.fn().mockResolvedValue({
        blurhashString: 'mock-blurhash',
        tinyBase64Url: 'data:image/png;base64,mock-tiny',
      }),
    }

    const mockGenerator = {
      generateVariant: jest.fn().mockResolvedValue({
        data: Buffer.from('mock-variant-buffer'),
        width: 1920,
        height: 1080,
      }),
    }

    const mockConfig = {
      get: jest.fn().mockReturnValue(3), // default concurrency
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaProcessingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MediaStorageService, useValue: mockStorage },
        { provide: BlurPlaceholderService, useValue: mockPlaceholders },
        { provide: VariantGeneratorService, useValue: mockGenerator },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()

    service = module.get<MediaProcessingService>(MediaProcessingService)
    prisma = module.get(PrismaService) as any
    storage = module.get(MediaStorageService) as any
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Settings Fingerprint', () => {
    it('should generate a deterministic Settings Fingerprint in constructor', () => {
      expect((service as any).settingsFingerprint).toBeDefined()
      expect(typeof (service as any).settingsFingerprint).toBe('string')
      expect((service as any).settingsFingerprint.length).toBe(64) // SHA-256 length in hex
    })
  })

  describe('processAsset', () => {
    it('should skip processing if the asset is already READY and fingerprints match', async () => {
      const assetId = 'asset-id-1'
      prisma.mediaAsset.findUnique.mockResolvedValue({
        id: assetId,
        processingState: MediaProcessingState.READY,
        transformationFingerprint: (service as any).settingsFingerprint,
        rawUrl: 'mock:url',
        coverGames: [],
        backdropGames: [],
        screenshots: [],
      } as any)

      await service.processAsset(assetId)

      expect(prisma.mediaAsset.update).not.toHaveBeenCalled()
      expect(storage.saveOriginal).not.toHaveBeenCalled()
    })

    it('should download and save original if it does not exist locally', async () => {
      const assetId = 'asset-id-2'
      prisma.mediaAsset.findUnique.mockResolvedValue({
        id: assetId,
        processingState: MediaProcessingState.PENDING,
        transformationFingerprint: null,
        rawUrl: 'mock:url',
        coverGames: [{ id: 'game-1' }],
        backdropGames: [],
        screenshots: [],
      } as any)

      storage.originalExists.mockResolvedValue(false)

      await service.processAsset(assetId)

      expect(storage.originalExists).toHaveBeenCalledWith(assetId)
      expect(storage.saveOriginal).toHaveBeenCalled()
      expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
        where: { id: assetId },
        data: expect.objectContaining({
          processingState: MediaProcessingState.READY,
          optimized: true,
          transformationFingerprint: (service as any).settingsFingerprint,
        }),
      })
    })

    it('should reuse existing original buffer to prevent variant-to-variant lossy re-compression', async () => {
      const assetId = 'asset-id-3'
      prisma.mediaAsset.findUnique.mockResolvedValue({
        id: assetId,
        processingState: MediaProcessingState.PENDING,
        transformationFingerprint: null,
        rawUrl: 'mock:url',
        coverGames: [],
        backdropGames: [{ id: 'game-1' }],
        screenshots: [],
      } as any)

      storage.originalExists.mockResolvedValue(true)
      storage.readOriginal.mockResolvedValue(Buffer.from('original-pristine-data'))

      await service.processAsset(assetId)

      expect(storage.originalExists).toHaveBeenCalledWith(assetId)
      expect(storage.readOriginal).toHaveBeenCalledWith(assetId)
      expect(storage.saveOriginal).not.toHaveBeenCalled() // skipped download saving
    })

    it('should perform deferred hero candidate scoring and assign candidates correctly for screenshots', async () => {
      const assetId = 'asset-id-4'
      const gameId = 'game-id-4'
      prisma.mediaAsset.findUnique.mockResolvedValue({
        id: assetId,
        processingState: MediaProcessingState.PENDING,
        transformationFingerprint: null,
        rawUrl: 'mock:url',
        coverGames: [],
        backdropGames: [],
        screenshots: [{ id: 'screenshot-1', gameId }],
      } as any)

      storage.originalExists.mockResolvedValue(true)
      storage.readOriginal.mockResolvedValue(Buffer.from('original-screenshot-data'))

      // Set up screenshots mock return list
      prisma.screenshot.findMany.mockResolvedValue([
        { id: 'screenshot-1', gameId, heroScore: 0.8 },
        { id: 'screenshot-2', gameId, heroScore: 0.6 },
      ] as any)

      await service.processAsset(assetId)

      // Verifies that screenshot records are scored
      expect(prisma.screenshot.updateMany).toHaveBeenCalledWith({
        where: { assetId },
        data: expect.objectContaining({
          heroScore: expect.any(Number),
        }),
      })

      // Verifies that primary hero promotion occurred for the highest scoring screenshot
      expect(prisma.screenshot.updateMany).toHaveBeenCalledWith({
        where: { gameId, id: 'screenshot-1' },
        data: { isPrimaryHeroCandidate: true },
      })

      // Verifies that other screenshots were set to false
      expect(prisma.screenshot.updateMany).toHaveBeenCalledWith({
        where: { gameId, id: { not: 'screenshot-1' } },
        data: { isPrimaryHeroCandidate: false },
      })
    })
  })
})
