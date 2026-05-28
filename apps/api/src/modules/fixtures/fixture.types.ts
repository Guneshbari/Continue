export interface FixtureMedia {
  rawUrl: string
  hash?: string
  optimized?: boolean
}

export interface FixtureTaxonomy {
  slug: string
  name: string
}

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
  coverUrl: string | null
  backdropUrl: string | null
  genres: string[]
  platforms: string[]
  themes: string[]
  developers: string[]
  publishers: string[]
  franchise: string | null
  trailers: Array<{ youtubeId: string; name: string | null }>
  screenshots: string[]
  avgRating: number | null
  ratingCount: number

  // EdgeCaseFlags
  missingScreenshots?: boolean
  ultraLongTitle?: boolean
  missingBackdrop?: boolean
  denseMetadata?: boolean
  highContrastBackdrop?: 'bright' | 'dark' | null

  // Fixture Versioning
  fixtureVersion?: number
}

export interface FixtureScenario {
  id: string
  name: string
  version: number
  description: string
  games: FixtureGame[]
}
