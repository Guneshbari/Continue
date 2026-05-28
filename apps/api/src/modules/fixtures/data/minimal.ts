// ─── Minimal Fixture Scenario ─────────────────────────────────────────────────
// Tests: Default layout rendering, empty-state fallbacks, basic cover display.
// No trailers, screenshots, themes, or franchises.

export interface FixtureGame {
  slug: string
  title: string
  description: string | null
  summary: string | null
  storyline: string | null
  releaseDate: string | null
  igdbId: number | null
  igdbRating: number | null
  igdbRatingCount: number | null
  status: string | null
  coverUrl: string | null   // raw IGDB-style URL
  backdropUrl: string | null
  genres: string[]          // slugs → upserted
  platforms: string[]       // slugs → upserted
  themes: string[]
  developers: string[]      // company names
  publishers: string[]
  franchise: string | null  // franchise name
  trailers: Array<{ youtubeId: string; name: string | null }>
  screenshots: string[]     // raw URLs
  avgRating: number | null
  ratingCount: number
}

export const MINIMAL_GAMES: FixtureGame[] = [
  {
    slug: 'hollow-knight',
    title: 'Hollow Knight',
    description: 'A challenging 2D action-adventure through a vast, ruined kingdom of insects and heroes.',
    summary: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.',
    storyline: null,
    releaseDate: '2017-02-24',
    igdbId: 27789,
    igdbRating: 87.4,
    igdbRatingCount: 1420,
    status: 'released',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg',
    backdropUrl: null,
    genres: ['platform', 'adventure'],
    platforms: ['pc', 'nintendo-switch', 'playstation-4'],
    themes: [],
    developers: ['Team Cherry'],
    publishers: ['Team Cherry'],
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: 8.7,
    ratingCount: 3,
  },
  {
    slug: 'stardew-valley',
    title: 'Stardew Valley',
    description: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley.',
    summary: 'A farming simulation RPG developed by ConcernedApe.',
    storyline: null,
    releaseDate: '2016-02-26',
    igdbId: 17000,
    igdbRating: 89.1,
    igdbRatingCount: 2100,
    status: 'released',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/xrpmydnu9rpxvxfjkiu7.jpg',
    backdropUrl: null,
    genres: ['role-playing-game', 'simulator'],
    platforms: ['pc', 'nintendo-switch', 'playstation-4', 'ios', 'android'],
    themes: [],
    developers: ['ConcernedApe'],
    publishers: ['ConcernedApe'],
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: 9.1,
    ratingCount: 2,
  },
  {
    slug: 'inside',
    title: 'Inside',
    description: 'A dark, narrative-driven platformer from Playdead.',
    summary: null,
    storyline: null,
    releaseDate: '2016-06-29',
    igdbId: 9600,
    igdbRating: 88.5,
    igdbRatingCount: 780,
    status: 'released',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nkk.jpg',
    backdropUrl: null,
    genres: ['platform', 'puzzle', 'adventure'],
    platforms: ['pc', 'xbox-one'],
    themes: [],
    developers: ['Playdead'],
    publishers: ['Playdead'],
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: 8.5,
    ratingCount: 1,
  },
  {
    slug: 'celeste',
    title: 'Celeste',
    description: 'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.',
    summary: 'Celeste is a precise, challenging platformer with a heartfelt story about mental health.',
    storyline: null,
    releaseDate: '2018-01-25',
    igdbId: 66894,
    igdbRating: 91.2,
    igdbRatingCount: 1120,
    status: 'released',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg',
    backdropUrl: null,
    genres: ['platform', 'adventure'],
    platforms: ['pc', 'nintendo-switch', 'playstation-4', 'xbox-one'],
    themes: [],
    developers: ['Extremely OK Games'],
    publishers: ['Extremely OK Games'],
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: null,
    ratingCount: 0,
  },
]
