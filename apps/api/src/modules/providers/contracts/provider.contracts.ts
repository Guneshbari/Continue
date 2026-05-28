export interface ProviderScreenshot {
  rawUrl: string
  position: number
}

export interface ProviderTrailer {
  youtubeId: string
  name: string | null
}

export interface ProviderGame {
  externalId: number
  slug: string
  title: string
  description: string | null
  summary: string | null
  storyline: string | null
  releaseDate: Date | null
  igdbRating: number | null
  igdbRatingCount: number | null
  coverUrl: string | null
  backdropUrl: string | null
  genres: string[]
  platforms: string[]
  themes: string[]
  developers: string[]
  publishers: string[]
  franchise: string | null
  screenshots: string[]
  trailers: ProviderTrailer[]
}
