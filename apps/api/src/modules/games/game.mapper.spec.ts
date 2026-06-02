import { GameMapper } from './game.mapper'

describe('GameMapper', () => {
  const mapper = new GameMapper()

  const game = {
    id: 'game_1',
    slug: 'celeste',
    title: 'Celeste',
    description: 'Climb the mountain.',
    summary: 'A precise platformer.',
    releaseDate: new Date('2018-01-25T00:00:00.000Z'),
    avgRating: 9.1,
    ratingCount: 42,
    igdbId: 123,
    igdbRating: 91,
    cover: {
      rawUrl: 'https://provider.example/cover.jpg',
      variants: [
        { role: 'COVER_SM', url: '/public/media/celeste/cover-sm.webp', width: 120, height: 160, blurPlaceholder: 'blur-cover' },
        { role: 'COVER_MD', url: '/public/media/celeste/cover-md.webp', width: 240, height: 320, blurPlaceholder: null },
        { role: 'COVER_LG', url: '/public/media/celeste/cover-lg.webp', width: 480, height: 640, blurPlaceholder: null },
      ],
    },
    backdrop: {
      rawUrl: 'https://provider.example/backdrop.jpg',
      variants: [
        { role: 'BACKDROP_HERO', url: '/public/media/celeste/hero.webp', width: 1920, height: 1080, blurPlaceholder: 'blur-hero' },
      ],
    },
    screenshots: [
      {
        asset: {
          rawUrl: 'https://provider.example/screenshot.jpg',
          variants: [
            { role: 'GALLERY_HD', url: '/public/media/celeste/screen.webp', width: 1280, height: 720, blurPlaceholder: 'blur-screen' },
          ],
        },
      },
    ],
    genres: [{ genre: { id: 'genre_1', slug: 'platform', name: 'Platform' } }],
    platforms: [{ platform: { id: 'platform_1', slug: 'pc', name: 'PC' } }],
    developers: [{ developer: { id: 'dev_1', slug: 'maddy-makes-games', name: 'Maddy Makes Games' } }],
    publishers: [{ publisher: { id: 'pub_1', slug: 'maddy-makes-games', name: 'Maddy Makes Games' } }],
    tags: [{ tag: { id: 'tag_1', slug: 'precision', name: 'Precision' } }],
    themes: [{ theme: { id: 'theme_1', slug: 'adventure', name: 'Adventure' } }],
    franchise: null,
    status: 'released',
  }

  it('maps game summaries to the canonical public contract', () => {
    expect(mapper.toSummaryDto(game)).toEqual({
      id: 'game_1',
      slug: 'celeste',
      title: 'Celeste',
      releaseDate: '2018-01-25T00:00:00.000Z',
      averageRating: 9.1,
      cover: {
        sm: '/public/media/celeste/cover-sm.webp',
        md: '/public/media/celeste/cover-md.webp',
        lg: '/public/media/celeste/cover-lg.webp',
        blur: 'blur-cover',
      },
    })
  })

  it('hides database, provider, and raw media fields in game details', () => {
    const detail = mapper.toDetailDto(game)
    const serialized = JSON.stringify(detail)

    expect(detail.rating).toEqual({ average: 9.1, count: 42 })
    expect(detail.metadata.developers).toEqual([
      { id: 'dev_1', slug: 'maddy-makes-games', name: 'Maddy Makes Games' },
    ])
    expect(detail.backdrop).toEqual({
      hero: '/public/media/celeste/hero.webp',
      blur: 'blur-hero',
    })
    expect(detail.screenshots).toEqual([
      {
        url: '/public/media/celeste/screen.webp',
        width: 1280,
        height: 720,
        blur: 'blur-screen',
      },
    ])
    expect(serialized).not.toContain('rawUrl')
    expect(serialized).not.toContain('igdb')
    expect(serialized).not.toContain('provider.example')
  })
})
