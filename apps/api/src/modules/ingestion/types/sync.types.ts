export interface SyncResult {
  status: 'created' | 'updated' | 'skipped' | 'failed'
  entityId: string | null
  externalId: string | number | null
  errors?: string[]
}

export interface SyncContext {
  provider: 'igdb' | 'mock'
  timestamp: Date
  force?: boolean
}

export interface TaxonomyResolutionResult {
  genres: string[] // DB IDs
  platforms: string[] // DB IDs
  themes: string[] // DB IDs
  developers: string[] // DB IDs
  publishers: string[] // DB IDs
  franchiseId: string | null
}

export interface MediaResolutionResult {
  coverId: string | null
  backdropId: string | null
}
