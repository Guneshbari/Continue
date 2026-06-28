import type { FixtureGame } from '../fixture.types'

const BASE_BROKEN_GAMES: FixtureGame[] = [
  {
    slug: 'no-cover-game',
    title: 'The Forgotten Archive',
    description: null,
    summary: null,
    storyline: null,
    releaseDate: '2015-03-12',
    igdbId: null,
    igdbRating: null,
    igdbRatingCount: null,
    status: null,
    coverUrl: null, // No cover — should render placeholder
    backdropUrl: null,
    genres: [], // No genres — should render fallback tag
    platforms: [], // No platforms — tests empty platform list
    themes: [],
    developers: [],
    publishers: [],
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: null, // No ratings at all
    ratingCount: 0,
    fixtureVersion: 1,
  },
  {
    slug: 'no-release-date-game',
    title: 'Unnamed Horizon Project',
    description: 'An experimental title with no confirmed release date and minimal metadata.',
    summary: null,
    storyline: null,
    releaseDate: null, // No release date — tests "TBA" fallback
    igdbId: null,
    igdbRating: null,
    igdbRatingCount: null,
    status: 'announced',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg',
    backdropUrl: null,
    genres: ['adventure'],
    platforms: ['pc'],
    themes: [],
    developers: ['Unknown Studio'],
    publishers: [], // No publisher — tests empty publisher list
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: null,
    ratingCount: 0,
    fixtureVersion: 1,
  },
  {
    slug: 'zero-rating-count-game',
    title: 'The Unreviewed',
    description: 'A game that no one has rated or reviewed. Tests zero-state rendering.',
    summary: 'An obscure title with complete metadata but no community engagement.',
    storyline: null,
    releaseDate: '2022-06-01',
    igdbId: null,
    igdbRating: 71.0,
    igdbRatingCount: 12,
    status: 'released',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg',
    backdropUrl: null,
    genres: ['platform'],
    platforms: ['pc', 'nintendo-switch'],
    themes: [],
    developers: ['Indie Studio'],
    publishers: ['Self Published'],
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: null, // avgRating null despite igdbRating existing
    ratingCount: 0, // Zero community ratings
    fixtureVersion: 1,
  },
  {
    slug: 'missing-description-game',
    title: 'No Synopsis Available',
    description: null, // No description — tests synopsis fallback rendering
    summary: null,
    storyline: null,
    releaseDate: '2019-08-14',
    igdbId: null,
    igdbRating: null,
    igdbRatingCount: null,
    status: 'released',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wj8.jpg',
    backdropUrl: null,
    genres: ['shooter'],
    platforms: ['playstation-4'],
    themes: [],
    developers: ['Mystery Dev'],
    publishers: ['Mystery Pub'],
    franchise: null,
    trailers: [],
    screenshots: [], // No screenshots — tests empty gallery state
    avgRating: 5.0,
    ratingCount: 1,
    fixtureVersion: 1,
  },
  {
    slug: 'all-nulls-game',
    title: 'Absolute Minimum',
    description: null,
    summary: null,
    storyline: null,
    releaseDate: null,
    igdbId: null,
    igdbRating: null,
    igdbRatingCount: null,
    status: null,
    coverUrl: null, // No cover
    backdropUrl: null, // No backdrop
    genres: [],
    platforms: [],
    themes: [],
    developers: [],
    publishers: [],
    franchise: null,
    trailers: [],
    screenshots: [],
    avgRating: null,
    ratingCount: 0,
    fixtureVersion: 1,
  },
]

// Generate 25 additional broken metadata games deterministically to reach exactly 30
const GENERATED_BROKEN_GAMES: FixtureGame[] = Array.from({ length: 25 }, (_, index) => {
  const i = index + 5
  const group = i % 5

  let title = `Broken Metadata Case ${i}`
  let coverUrl: string | null = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg'
  let backdropUrl: string | null =
    'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scfm9u.jpg'
  let description: string | null =
    `This is broken metadata case number ${i} which isolates specific empty-state fallbacks.`
  let genres: string[] = ['adventure']
  let platforms: string[] = ['pc']
  let screenshots: string[] = [
    'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scfm9u.jpg',
  ]
  let highContrastBackdrop: 'bright' | 'dark' | null = null

  if (group === 0) {
    // Group 0: No screenshots (missingScreenshots = true)
    title = `Incomplete Gallery Game ${i}`
    screenshots = []
  } else if (group === 1) {
    // Group 1: No backdrop (missingBackdrop = true)
    title = `No Backdrop Display ${i}`
    backdropUrl = null
  } else if (group === 2) {
    // Group 2: High contrast backdrops (testing readability over images)
    title = `High Contrast Theme ${i}`
    highContrastBackdrop = i % 2 === 0 ? 'bright' : 'dark'
    // Solid white or black placeholder image URLs to simulate extreme contrast
    backdropUrl =
      i % 2 === 0
        ? 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scfm9w.jpg' // bright white-heavy image
        : 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scfm9v.jpg' // dark black-heavy image
  } else if (group === 3) {
    // Group 3: No cover (coverUrl = null)
    title = `Missing Visual Cover ${i}`
    coverUrl = null
  } else {
    // Group 4: All nulls/TBA (tba release, no description, no categories)
    title = `Obscure Prototype Project ${i}`
    coverUrl = null
    backdropUrl = null
    description = null
    genres = []
    platforms = []
    screenshots = []
  }

  return {
    slug: `broken-metadata-game-${i}`,
    title,
    description,
    summary: null,
    storyline: null,
    releaseDate: group === 4 ? null : `202${i % 10}-10-22`,
    igdbId: null,
    igdbRating: null,
    igdbRatingCount: null,
    status: group === 4 ? 'announced' : 'released',
    coverUrl,
    backdropUrl,
    genres,
    platforms,
    themes: [],
    developers: group === 4 ? [] : ['Anonymous Creator'],
    publishers: [],
    franchise: null,
    trailers: [],
    screenshots,
    avgRating: null,
    ratingCount: 0,
    missingScreenshots: group === 0,
    missingBackdrop: group === 1 || group === 4,
    highContrastBackdrop,
    fixtureVersion: 1,
  }
})

export const BROKEN_METADATA_GAMES: FixtureGame[] = [
  ...BASE_BROKEN_GAMES,
  ...GENERATED_BROKEN_GAMES,
]
