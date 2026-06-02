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

export interface MediaVariantDTO {
  role: 'COVER_SM' | 'COVER_MD' | 'COVER_LG' | 'BACKDROP_HERO' | 'GALLERY_HD' | 'THUMBNAIL_BLUR' | 'AVATAR_SM' | 'AVATAR_MD' | 'LOGO_TRANSPARENT'
  url: string
  width: number | null
  height: number | null
  format: string
  blurPlaceholder: string | null
}

export interface CanonicalMediaDTO {
  rawUrl: string
  optimized: boolean
  variants: MediaVariantDTO[]
  heroScore?: number | null
  isPrimaryHeroCandidate?: boolean
}

export interface CoverManifest {
  sm: string | null
  md: string | null
  lg: string | null
  blur: string | null
}

export interface BackdropManifest {
  hero: string | null
  blur: string | null
}

export interface ScreenshotManifest {
  url: string | null
  width: number | null
  height: number | null
  blur: string | null
}

export interface CanonicalGameSummary {
  id: string
  slug: string
  title: string
  releaseDate: string | null
  averageRating: number | null
  cover: CoverManifest | null
}

export interface CanonicalGameDetail extends CanonicalGameSummary {
  summary: string | null
  genres: GenreSummary[]
  platforms: PlatformSummary[]
  backdrop: BackdropManifest | null
  screenshots: ScreenshotManifest[]
  rating: {
    average: number | null
    count: number
  }
  metadata: {
    developers: CompanySummary[]
    publishers: CompanySummary[]
    tags: TagSummary[]
    themes: ThemeSummary[]
    franchise: FranchiseSummary | null
    status: string | null
  }
}

export interface CanonicalGamesPage {
  items: CanonicalGameSummary[]
  page: number
  limit: number
  total: number
  hasNext: boolean
}

export interface GameShelf {
  id: string
  title: string
  items: CanonicalGameSummary[]
}

export interface GameSummary {
  id: string
  slug: string
  title: string
  cover?: CanonicalMediaDTO | null
  coverUrl?: string | null // transitional helper
  releaseDate: string | null
  avgRating: number | null
  ratingCount: number
  genres: GenreSummary[]
  platforms: PlatformSummary[]
}

export interface GameDetail extends GameSummary {
  description: string | null
  backdrop?: CanonicalMediaDTO | null
  bannerUrl?: string | null // transitional helper
  developer?: string | null // transitional helper
  publisher?: string | null // transitional helper
  summary?: string | null
  storyline?: string | null
  igdbRating?: number | null
  igdbRatingCount?: number | null
  status?: string | null
  franchise?: FranchiseSummary | null
  developers?: CompanySummary[]
  publishers?: CompanySummary[]
  tags?: TagSummary[]
  screenshots?: CanonicalMediaDTO[]
  trailers?: TrailerSummary[]
  themes?: ThemeSummary[]
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

export interface TrailerSummary {
  id: string
  youtubeId: string
  name: string | null
}

export interface CompanySummary {
  id: string
  slug: string
  name: string
}

export interface ThemeSummary {
  id: string
  slug: string
  name: string
}

export interface FranchiseSummary {
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
  isSpoiler: boolean
  createdAt: string
  updatedAt: string
  user: Pick<UserPublic, 'id' | 'username' | 'displayName' | 'avatarUrl'>
}

/**
 * Featured review shape — returned by GET /reviews/featured.
 * Includes denormalized game data for homepage display.
 */
export interface FeaturedReview {
  id: string
  body: string
  isSpoiler: boolean
  createdAt: string
  user: {
    id: string
    username: string
    displayName: string | null
  }
  game: {
    id: string
    slug: string
    title: string
    coverUrl: string | null
  }
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

/**
 * Community collection shape — returned by GET /lists/discovery.
 * Shaped for homepage mosaic card display.
 */
export interface DiscoveryCollection {
  id: string
  slug: string
  title: string
  description: string | null
  gameCount: number
  curator: {
    username: string
    displayName: string
  }
  covers: string[] // up to 3 game cover URLs
}

// ─── Paginated response shapes ────────────────────────────────────────────────

export interface GamesListResponse {
  data: GameSummary[]
  meta: {
    nextCursor: string | null
    total?: number
  }
}
