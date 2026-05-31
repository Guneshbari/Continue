export interface SyncGamePayload {
  slug?: string
  gameId?: string
}

export interface SyncPopularGamesPayload {
  limit?: number
}

export interface RefreshStaleGamesPayload {
  staleOlderThanDays?: number
}

export interface ProcessMediaPayload {
  assetId: string
}

export interface DeadLetterPayload {
  originalQueue: string
  jobName: string
  payload: any
  errorMessage: string
  failedAt: string
  attemptsMade: number
}
