import { GameMapper } from './game.mapper'

describe('GameMapper', () => {
  let mapper: GameMapper

  beforeEach(() => {
    mapper = new GameMapper()
  })

  describe('toCoverManifest', () => {
    it('should return null when cover is null/undefined', () => {
      expect(mapper.toCoverManifest(null)).toBeNull()
      expect(mapper.toCoverManifest(undefined)).toBeNull()
    })

    it('should extract sm, md, and lg cover variants', () => {
      const mockAsset = {
        rawUrl: 'https://raw-url.com/cover.jpg',
        optimized: true,
        variants: [
          { role: 'COVER_SM', url: 'https://opt.com/cover_sm.webp' },
          { role: 'COVER_MD', url: 'https://opt.com/cover_md.webp' },
          { role: 'COVER_LG', url: 'https://opt.com/cover_lg.webp' },
        ],
      }
      const result = mapper.toCoverManifest(mockAsset)
      expect(result).toEqual({
        sm: 'https://opt.com/cover_sm.webp',
        md: 'https://opt.com/cover_md.webp',
        lg: 'https://opt.com/cover_lg.webp',
      })
    })

    it('should fall back to raw URL if variants are missing', () => {
      const mockAsset = {
        rawUrl: 'https://raw-url.com/cover.jpg',
        optimized: false,
        variants: [],
      }
      const result = mapper.toCoverManifest(mockAsset)
      expect(result).toEqual({
        sm: 'https://raw-url.com/cover.jpg',
        md: 'https://raw-url.com/cover.jpg',
        lg: 'https://raw-url.com/cover.jpg',
      })
    })
  })

  describe('toBackdropManifest', () => {
    it('should extract hero backdrop variant', () => {
      const mockAsset = {
        rawUrl: 'https://raw-url.com/bd.jpg',
        variants: [{ role: 'BACKDROP_HERO', url: 'https://opt.com/bd_hero.webp' }],
      }
      const result = mapper.toBackdropManifest(mockAsset)
      expect(result).toEqual({
        hero: 'https://opt.com/bd_hero.webp',
      })
    })
  })

  describe('toScreenshotDto', () => {
    it('should return null when screenshot is invalid', () => {
      expect(mapper.toScreenshotDto(null)).toBeNull()
      expect(mapper.toScreenshotDto({ asset: null })).toBeNull()
    })

    it('should map screenshot asset details', () => {
      const mockScreenshot = {
        heroScore: 0.95,
        isPrimaryHeroCandidate: true,
        asset: {
          id: 'asset-1',
          rawUrl: 'https://raw-url.com/ss.jpg',
          variants: [{ role: 'GALLERY_HD', url: 'https://opt.com/ss_hd.webp' }],
        },
      }
      const result = mapper.toScreenshotDto(mockScreenshot)
      expect(result).toEqual({
        id: 'asset-1',
        url: 'https://opt.com/ss_hd.webp',
        heroScore: 0.95,
        isPrimaryHeroCandidate: true,
      })
    })
  })

  describe('toSummaryDto', () => {
    it('should correctly format Prisma game summary details', () => {
      const mockGame = {
        id: 'game-1',
        slug: 'hades-ii',
        title: 'Hades II',
        releaseDate: new Date('2024-05-06T00:00:00Z'),
        avgRating: 9.2,
        cover: {
          rawUrl: 'https://raw.com/cover.jpg',
          variants: [{ role: 'COVER_MD', url: 'https://opt.com/cover_md.webp' }],
        },
        genres: [{ genre: { id: 'g1', slug: 'action', name: 'Action' } }],
        platforms: [{ platform: { id: 'p1', slug: 'pc', name: 'PC' } }],
      }

      const result = mapper.toSummaryDto(mockGame)
      expect(result.id).toBe('game-1')
      expect(result.slug).toBe('hades-ii')
      expect(result.title).toBe('Hades II')
      expect(result.releaseDate).toBe('2024-05-06T00:00:00.000Z')
      expect(result.averageRating).toBe(9.2)
      expect(result.cover).toEqual({
        sm: 'https://raw.com/cover.jpg',
        md: 'https://opt.com/cover_md.webp',
        lg: 'https://raw.com/cover.jpg',
      })
      expect(result.genres).toEqual([{ id: 'g1', slug: 'action', name: 'Action' }])
      expect(result.platforms).toEqual([{ id: 'p1', slug: 'pc', name: 'PC' }])
    })
  })

  describe('toDetailDto', () => {
    it('should compile complete metadata and ratings parameters', () => {
      const mockGame = {
        id: 'game-2',
        slug: 'hades-ii-deluxe',
        title: 'Hades II Deluxe',
        summary: 'Detailed summary',
        storyline: 'Detailed storyline',
        releaseDate: new Date('2024-05-06T00:00:00Z'),
        avgRating: 9.5,
        ratingCount: 15,
        igdbRating: 94.0,
        igdbRatingCount: 300,
        status: 'released',
        cover: null,
        backdrop: {
          rawUrl: 'https://raw.com/bd.jpg',
          variants: [{ role: 'BACKDROP_HERO', url: 'https://opt.com/bd.webp' }],
        },
        genres: [],
        platforms: [],
        developers: [{ developer: { name: 'Supergiant Games' } }],
        publishers: [{ publisher: { name: 'Supergiant Games Inc' } }],
        themes: [{ theme: { name: 'Mythology' } }],
        tags: [{ tag: { name: 'Indie' } }],
        franchise: { name: 'Hades Franchise' },
        screenshots: [
          {
            heroScore: 0.88,
            isPrimaryHeroCandidate: false,
            asset: {
              id: 'asset-2',
              rawUrl: 'https://raw.com/ss2.jpg',
              variants: [],
            },
          },
        ],
      }

      const result = mapper.toDetailDto(mockGame)
      expect(result.id).toBe('game-2')
      expect(result.summary).toBe('Detailed summary')
      expect(result.storyline).toBe('Detailed storyline')
      expect(result.cover).toBeNull()
      expect(result.backdrop).toEqual({ hero: 'https://opt.com/bd.webp' })
      expect(result.rating).toEqual({
        averageRating: 9.5,
        ratingCount: 15,
        externalRating: 94.0,
        externalRatingCount: 300,
      })
      expect(result.metadata).toEqual({
        status: 'released',
        developer: 'Supergiant Games',
        publisher: 'Supergiant Games Inc',
        developers: ['Supergiant Games'],
        publishers: ['Supergiant Games Inc'],
        themes: ['Mythology'],
        tags: ['Indie'],
        franchise: 'Hades Franchise',
      })
      expect(result.screenshots).toEqual([
        {
          id: 'asset-2',
          url: 'https://raw.com/ss2.jpg',
          heroScore: 0.88,
          isPrimaryHeroCandidate: false,
        },
      ])
    })
  })

  describe('toShelfDto', () => {
    it('should map trending games shelf correctly', () => {
      const mockGame = {
        id: 'game-1',
        slug: 'hades-ii',
        title: 'Hades II',
        releaseDate: null,
        avgRating: null,
        cover: null,
        genres: [],
        platforms: [],
      }
      const result = mapper.toShelfDto('trending', 'Trending Shelf', [mockGame])
      expect(result).toEqual({
        id: 'trending',
        title: 'Trending Shelf',
        items: [
          {
            id: 'game-1',
            slug: 'hades-ii',
            title: 'Hades II',
            releaseDate: null,
            averageRating: null,
            cover: null,
            genres: [],
            platforms: [],
          },
        ],
      })
    })
  })
})
