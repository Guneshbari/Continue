// ─── Shared Domain Types ─────────────────────────────────────────────────────
// Used by both frontend (Next.js) and backend (NestJS).
// No runtime deps — pure type declarations only.

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'
export type ReviewStatus = 'PUBLISHED' | 'DRAFT' | 'REMOVED'
export type ListVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED'

// ─── API response wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
}

export interface ApiError {
  statusCode: number
  error: string
  message: string | string[]
}

export interface ApiMeta {
  total?: number
  page?: number
  limit?: number
  nextCursor?: string | null
  prevCursor?: string | null
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string
  username: string
  email: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  role: UserRole
  createdAt: string
}

export interface UserProfile extends UserPublic {
  reviewCount: number
  ratingCount: number
  listCount: number
}

// ─── Game ────────────────────────────────────────────────────────────────────

export interface GameSummary {
  id: string
  slug: string
  title: string
  coverUrl: string | null
  releaseDate: string | null
  avgRating: number | null
  ratingCount: number
  genres: GenreSummary[]
  platforms: PlatformSummary[]
}

export interface GameDetail extends GameSummary {
  description: string | null
  bannerUrl: string | null
  developer: string | null
  publisher: string | null
  tags: TagSummary[]
}

// ─── Supporting entities ─────────────────────────────────────────────────────

export interface GenreSummary {
  id: string
  slug: string
  name: string
}

export interface PlatformSummary {
  id: string
  slug: string
  name: string
}

export interface TagSummary {
  id: string
  slug: string
  name: string
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface ReviewSummary {
  id: string
  userId: string
  gameId: string
  title: string | null
  body: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
  user: Pick<UserPublic, 'id' | 'username' | 'displayName' | 'avatarUrl'>
}

// ─── Rating ──────────────────────────────────────────────────────────────────

export interface RatingSummary {
  id: string
  userId: string
  gameId: string
  score: number
  updatedAt: string
}

// ─── List ────────────────────────────────────────────────────────────────────

export interface ListSummary {
  id: string
  slug: string
  title: string
  description: string | null
  visibility: ListVisibility
  itemCount: number
  user: Pick<UserPublic, 'id' | 'username' | 'displayName'>
}
