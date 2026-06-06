import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { GamesController } from './games.controller'
import { ShelvesController } from './shelves.controller'
import { GamesService } from './games.service'
import { DiscoveryService } from '../discovery/services/discovery.service'
import type { GameSummaryDto } from './dto/game-summary.dto'
import type { GameDetailDto } from './dto/game-detail.dto'
import type { ShelfDto } from './dto/shelf.dto'
import type { PaginatedResponseDto } from './dto/pagination.dto'
import type { FastifyReply } from 'fastify'

describe('Games & Shelves Controllers', () => {
  let gamesController: GamesController
  let shelvesController: ShelvesController
  let gamesService: jest.Mocked<GamesService>
  let discoveryService: jest.Mocked<DiscoveryService>

  const mockFastifyReply = () => {
    const res = {
      header: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
    return res as unknown as FastifyReply
  }

  beforeEach(async () => {
    const mockGamesService = {
      findBySlug: jest.fn(),
      create: jest.fn(),
    }

    const mockDiscoveryService = {
      findAll: jest.fn(),
      findFilters: jest.fn(),
      findShelf: jest.fn(),
      findDiscoverDashboard: jest.fn(),
      search: jest.fn(),
      suggestions: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController, ShelvesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
        {
          provide: DiscoveryService,
          useValue: mockDiscoveryService,
        },
      ],
    }).compile()

    gamesController = module.get<GamesController>(GamesController)
    shelvesController = module.get<ShelvesController>(ShelvesController)
    gamesService = module.get(GamesService) as any
    discoveryService = module.get(DiscoveryService) as any
  })

  describe('GamesController', () => {
    it('findAll should return a paginated response of game summaries', async () => {
      const mockResult: PaginatedResponseDto<GameSummaryDto> = {
        items: [
          {
            id: 'game-1',
            slug: 'test-game',
            title: 'Test Game',
            genres: [],
            platforms: [],
          },
        ],
        page: 1,
        limit: 24,
        total: 1,
        hasNext: false,
      }
      discoveryService.findAll.mockResolvedValue(mockResult)

      const result = await gamesController.findAll({ page: 1, limit: 24 })
      expect(result).toEqual(mockResult)
      expect(discoveryService.findAll).toHaveBeenCalledWith({ page: 1, limit: 24 })
    })

    it('findOne should return canonical GameDetailDto', async () => {
      const mockDetail: GameDetailDto = {
        id: 'game-1',
        slug: 'test-game',
        title: 'Test Game',
        genres: [],
        platforms: [],
        screenshots: [],
        rating: {
          averageRating: 9.0,
          ratingCount: 10,
          externalRating: null,
          externalRatingCount: null,
        },
        metadata: { developers: [], publishers: [], themes: [], tags: [] },
      }
      gamesService.findBySlug.mockResolvedValue(mockDetail)

      const result = await gamesController.findOne('test-game')
      expect(result).toEqual(mockDetail)
      expect(gamesService.findBySlug).toHaveBeenCalledWith('test-game')
    })

    it('filters should return available taxonomies and set cache control headers', async () => {
      const mockFilters = { genres: [], platforms: [], themes: [], releaseYears: [] }
      discoveryService.findFilters.mockResolvedValue(mockFilters)

      const reply = mockFastifyReply()
      const result = await gamesController.filters(reply)

      expect(result).toEqual(mockFilters)
      expect(reply.header).toHaveBeenCalledWith(
        'Cache-Control',
        'public, s-maxage=3600, stale-while-revalidate=600',
      )
      expect(discoveryService.findFilters).toHaveBeenCalled()
    })
  })

  describe('ShelvesController', () => {
    it('getTrending should return ShelfDto and append caching headers', async () => {
      const mockShelf: ShelfDto = {
        id: 'trending',
        title: 'Trending Games',
        items: [],
      }
      discoveryService.findShelf.mockResolvedValue(mockShelf)

      const reply = mockFastifyReply()
      const result = await shelvesController.getTrending(12, reply)

      expect(result).toEqual(mockShelf)
      expect(reply.header).toHaveBeenCalledWith(
        'Cache-Control',
        'public, s-maxage=300, stale-while-revalidate=60',
      )
      expect(discoveryService.findShelf).toHaveBeenCalledWith('trending', 12)
    })

    it('getTopRated should return ShelfDto', async () => {
      const mockShelf: ShelfDto = {
        id: 'top-rated',
        title: 'Top Rated Games',
        items: [],
      }
      discoveryService.findShelf.mockResolvedValue(mockShelf)

      const reply = mockFastifyReply()
      const result = await shelvesController.getTopRated(6, reply)

      expect(result).toEqual(mockShelf)
      expect(discoveryService.findShelf).toHaveBeenCalledWith('top-rated', 6)
    })

    it('getRecentReleases should return ShelfDto', async () => {
      const mockShelf: ShelfDto = {
        id: 'recent-releases',
        title: 'Recent Releases',
        items: [],
      }
      discoveryService.findShelf.mockResolvedValue(mockShelf)

      const reply = mockFastifyReply()
      const result = await shelvesController.getRecentReleases(8, reply)

      expect(result).toEqual(mockShelf)
      expect(discoveryService.findShelf).toHaveBeenCalledWith('recent-releases', 8)
    })
  })
})
