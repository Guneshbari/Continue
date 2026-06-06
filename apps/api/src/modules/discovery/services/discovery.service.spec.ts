import { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { DiscoveryService } from './discovery.service'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { GameMapper } from '../../games/game.mapper'
import { SEARCH_PROVIDER } from '../providers/search-provider.interface'
import { PrismaSearchProvider } from '../providers/prisma-search.provider'
import { FacetAggregationService } from './facet-aggregation.service'
import { TrendingStrategy } from '../strategies/trending.strategy'
import { TopRatedStrategy } from '../strategies/top-rated.strategy'
import { RecentReleasesStrategy } from '../strategies/recent-releases.strategy'
import { NewlyAddedStrategy } from '../strategies/newly-added.strategy'
import { HiddenGemsStrategy } from '../strategies/hidden-gems.strategy'

describe('DiscoveryService & Search Engine', () => {
  let discoveryService: DiscoveryService

  // Mock datasets
  const mockGamesList = [
    {
      id: 'game-1',
      slug: 'elden-ring',
      title: 'Elden Ring',
      releaseDate: new Date('2022-02-25'),
      avgRating: 9.6,
      ratingCount: 150,
      createdAt: new Date('2022-02-25'),
      deletedAt: null,
      cover: null,
      genres: [],
      platforms: [],
    },
    {
      id: 'game-2',
      slug: 'elden-ring-shadow-erdtree',
      title: 'Elden Ring: Shadow of the Erdtree',
      releaseDate: new Date('2024-06-21'),
      avgRating: 9.8,
      ratingCount: 80,
      createdAt: new Date('2024-06-21'),
      deletedAt: null,
      cover: null,
      genres: [],
      platforms: [],
    },
    {
      id: 'game-3',
      slug: 'witcher-3',
      title: 'The Witcher 3: Wild Hunt',
      releaseDate: new Date('2015-05-19'),
      avgRating: 9.5,
      ratingCount: 300,
      createdAt: new Date('2015-05-19'),
      deletedAt: null,
      cover: null,
      genres: [],
      platforms: [],
    },
    {
      id: 'game-4',
      slug: 'hidden-indie',
      title: 'Hidden Indie Gem',
      releaseDate: new Date('2026-01-01'),
      avgRating: 8.5,
      ratingCount: 4, // fits hidden gems
      createdAt: new Date('2026-01-01'),
      deletedAt: null,
      cover: null,
      genres: [],
      platforms: [],
    },
    {
      id: 'game-5',
      slug: 'cpp-quest',
      title: 'C++ Quest',
      releaseDate: new Date('2025-01-01'),
      avgRating: 8.9,
      ratingCount: 60,
      createdAt: new Date('2025-01-01'),
      deletedAt: null,
      cover: null,
      genres: [],
      platforms: [],
    },
  ]

  const mockPrisma = {
    game: {
      findMany: jest.fn().mockImplementation((args) => {
        let list = [...mockGamesList]
        if (args?.where?.OR) {
          // simple term matching mock
          const titleTerm = args.where.OR[0].title.contains.toLowerCase()
          const slugTerm = args.where.OR[1].slug.contains.toLowerCase()
          list = list.filter(
            (g) =>
              g.title.toLowerCase().includes(titleTerm) || g.slug.toLowerCase().includes(slugTerm),
          )
        }
        if (args?.where?.avgRating?.gte !== undefined) {
          list = list.filter((g) => g.avgRating >= args.where.avgRating.gte)
        }
        if (args?.where?.ratingCount?.gte !== undefined) {
          list = list.filter((g) => g.ratingCount >= args.where.ratingCount.gte)
        }
        if (args?.where?.ratingCount?.lte !== undefined) {
          list = list.filter((g) => g.ratingCount <= args.where.ratingCount.lte)
        }
        if (args?.orderBy?.ratingCount === 'desc') {
          list.sort((a, b) => b.ratingCount - a.ratingCount)
        }
        return Promise.resolve(list.slice(0, args?.take || 100))
      }),
      count: jest.fn().mockImplementation((args) => {
        if (!args?.where?.OR) {
          return Promise.resolve(mockGamesList.length)
        }
        const titleTerm = args.where.OR[0].title.contains.toLowerCase()
        const slugTerm = args.where.OR[1].slug.contains.toLowerCase()
        return Promise.resolve(
          mockGamesList.filter(
            (g) =>
              g.title.toLowerCase().includes(titleTerm) || g.slug.toLowerCase().includes(slugTerm),
          ).length,
        )
      }),
    },
    gameGenre: {
      groupBy: jest.fn().mockResolvedValue([{ genreId: 'genre-rpg', _count: { gameId: 45 } }]),
    },
    gamePlatform: {
      groupBy: jest.fn().mockResolvedValue([
        { platformId: 'platform-playstation', _count: { gameId: 80 } },
        { platformId: 'platform-pc', _count: { gameId: 80 } },
      ]),
    },
    gameTheme: {
      groupBy: jest.fn().mockResolvedValue([{ themeId: 'theme-fantasy', _count: { gameId: 30 } }]),
    },
    genre: {
      findMany: jest.fn().mockResolvedValue([{ id: 'genre-rpg', slug: 'rpg', name: 'RPG' }]),
    },
    platform: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'platform-playstation', slug: 'playstation', name: 'PlayStation' },
        { id: 'platform-pc', slug: 'pc', name: 'PC' },
      ]),
    },
    theme: {
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: 'theme-fantasy', slug: 'fantasy', name: 'Fantasy' }]),
    },
  }

  const mockConfig = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'DISCOVERY_TRENDING_RECENCY_DECAY') return 1.5
      if (key === 'DISCOVERY_TOP_RATED_MIN_REVIEWS') return 5
      if (key === 'DISCOVERY_HIDDEN_GEMS_MAX_REVIEWS') return 10
      if (key === 'DISCOVERY_SHELF_DEFAULT_LIMIT') return 6
      return null
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoveryService,
        GameMapper,
        FacetAggregationService,
        TrendingStrategy,
        TopRatedStrategy,
        RecentReleasesStrategy,
        NewlyAddedStrategy,
        HiddenGemsStrategy,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: SEARCH_PROVIDER, useClass: PrismaSearchProvider },
      ],
    }).compile()

    discoveryService = module.get<DiscoveryService>(DiscoveryService)
  })

  it('should be defined', () => {
    expect(discoveryService).toBeDefined()
  })

  describe('Search and Autocomplete', () => {
    it('should normalize, perform search, and rank exact matches first', async () => {
      const result = await discoveryService.search({ q: 'elden-ring', limit: 10, page: 1 })

      // Contract snapshot validation
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
      expect(result.items.length).toBeGreaterThan(0)

      // Exact title match should be first
      const firstResult = result.items[0]
      if (!firstResult) throw new Error('Expected at least one search result')
      expect(firstResult.slug).toBe('elden-ring')
      // Highlight should be injected
      expect(firstResult).toHaveProperty('highlights')
      expect(firstResult.highlights?.[0]?.field).toBe('title')
      expect(firstResult.highlights?.[0]?.snippet).toContain('<em>Elden Ring</em>')
    })

    it('should return autocomplete suggestions with COVER_MD', async () => {
      const suggestions = await discoveryService.suggestions({ q: 'elden', limit: 5 })
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]).toHaveProperty('id')
      expect(suggestions[0]).toHaveProperty('title')
      expect(suggestions[0]).toHaveProperty('slug')
      expect(suggestions[0]).toHaveProperty('coverUrl')
    })

    it('should safely highlight search terms containing regex symbols', async () => {
      const result = await discoveryService.search({ q: 'C++', limit: 10, page: 1 })

      const firstResult = result.items[0]
      if (!firstResult) throw new Error('Expected C++ search result')
      expect(firstResult.slug).toBe('cpp-quest')
      expect(firstResult.highlights?.[0]?.snippet).toBe('<em>C++</em> Quest')
    })
  })

  describe('Facet Aggregation Metadata', () => {
    it('should generate filter metadata with counts', async () => {
      const metadata = await discoveryService.findFilters()

      // Snapshot schema validation
      expect(metadata).toHaveProperty('genres')
      expect(metadata).toHaveProperty('platforms')
      expect(metadata).toHaveProperty('themes')
      expect(metadata).toHaveProperty('releaseYears')

      expect(metadata.genres[0]).toEqual({
        id: 'genre-rpg',
        slug: 'rpg',
        name: 'RPG',
        count: 45,
      })
      expect(metadata.platforms.map((platform) => platform.slug)).toEqual(['pc', 'playstation'])
      expect(metadata.releaseYears.length).toBeGreaterThan(0)
    })
  })

  describe('Shelf Ranking Strategies', () => {
    it('trending strategy should rank recent games higher than old games with decay', async () => {
      const trendingShelf = await discoveryService.findShelf('trending', 5)

      expect(trendingShelf).toHaveProperty('id', 'trending')
      expect(trendingShelf.items.length).toBeGreaterThan(0)

      // Shadow of the Erdtree (2024) should rank higher than Witcher 3 (2015) despite lower ratingCount
      const shadowedIndex = trendingShelf.items.findIndex(
        (i) => i.slug === 'elden-ring-shadow-erdtree',
      )
      const witcherIndex = trendingShelf.items.findIndex((i) => i.slug === 'witcher-3')
      expect(shadowedIndex).toBeLessThan(witcherIndex)
    })

    it('top-rated strategy should apply min reviews constraint', async () => {
      const topRatedShelf = await discoveryService.findShelf('top-rated', 5)
      expect(topRatedShelf.items.length).toBeGreaterThan(0)
      // Hidden indie game only has 4 reviews, minReviews is 5, so it must not be in the shelf
      const hasHiddenIndie = topRatedShelf.items.some((i) => i.slug === 'hidden-indie')
      expect(hasHiddenIndie).toBe(false)
    })

    it('hidden gems strategy should fetch highly rated games under max reviews limit', async () => {
      const hiddenGemsShelf = await discoveryService.findShelf('hidden-gems', 5)
      expect(hiddenGemsShelf.items.length).toBeGreaterThan(0)
      // Must contain Hidden Indie (has 4 reviews, max allowed is 10)
      const hasHiddenIndie = hiddenGemsShelf.items.some((i) => i.slug === 'hidden-indie')
      expect(hasHiddenIndie).toBe(true)
    })
  })
})
