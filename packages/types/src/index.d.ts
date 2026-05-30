export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type ReviewStatus = 'PUBLISHED' | 'DRAFT' | 'REMOVED';
export type ListVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
export interface ApiResponse<T> {
    data: T;
    meta?: ApiMeta;
}
export interface ApiError {
    statusCode: number;
    error: string;
    message: string | string[];
}
export interface ApiMeta {
    total?: number;
    page?: number;
    limit?: number;
    nextCursor?: string | null;
    prevCursor?: string | null;
}
export interface UserPublic {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    role: UserRole;
    createdAt: string;
}
export interface UserProfile extends UserPublic {
    reviewCount: number;
    ratingCount: number;
    listCount: number;
}
export interface MediaVariantDTO {
    role: 'COVER_SM' | 'COVER_MD' | 'COVER_LG' | 'BACKDROP_HERO' | 'GALLERY_HD' | 'THUMBNAIL_BLUR' | 'AVATAR_SM' | 'AVATAR_MD' | 'LOGO_TRANSPARENT';
    url: string;
    width: number | null;
    height: number | null;
    format: string;
    blurPlaceholder: string | null;
}
export interface CanonicalMediaDTO {
    rawUrl: string;
    optimized: boolean;
    variants: MediaVariantDTO[];
    heroScore?: number | null;
    isPrimaryHeroCandidate?: boolean;
}
export interface GameSummary {
    id: string;
    slug: string;
    title: string;
    cover?: CanonicalMediaDTO | null;
    coverUrl?: string | null;
    releaseDate: string | null;
    avgRating: number | null;
    ratingCount: number;
    genres: GenreSummary[];
    platforms: PlatformSummary[];
}
export interface GameDetail extends GameSummary {
    description: string | null;
    backdrop?: CanonicalMediaDTO | null;
    bannerUrl?: string | null;
    developer?: string | null;
    publisher?: string | null;
    summary?: string | null;
    storyline?: string | null;
    igdbRating?: number | null;
    igdbRatingCount?: number | null;
    status?: string | null;
    franchise?: FranchiseSummary | null;
    developers?: CompanySummary[];
    publishers?: CompanySummary[];
    tags?: TagSummary[];
    screenshots?: CanonicalMediaDTO[];
    trailers?: TrailerSummary[];
    themes?: ThemeSummary[];
}
export interface GenreSummary {
    id: string;
    slug: string;
    name: string;
}
export interface PlatformSummary {
    id: string;
    slug: string;
    name: string;
}
export interface TagSummary {
    id: string;
    slug: string;
    name: string;
}
export interface TrailerSummary {
    id: string;
    youtubeId: string;
    name: string | null;
}
export interface CompanySummary {
    id: string;
    slug: string;
    name: string;
}
export interface ThemeSummary {
    id: string;
    slug: string;
    name: string;
}
export interface FranchiseSummary {
    id: string;
    slug: string;
    name: string;
}
export interface ReviewSummary {
    id: string;
    userId: string;
    gameId: string;
    title: string | null;
    body: string;
    status: ReviewStatus;
    isSpoiler: boolean;
    createdAt: string;
    updatedAt: string;
    user: Pick<UserPublic, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
}
/**
 * Featured review shape — returned by GET /reviews/featured.
 * Includes denormalized game data for homepage display.
 */
export interface FeaturedReview {
    id: string;
    body: string;
    isSpoiler: boolean;
    createdAt: string;
    user: {
        id: string;
        username: string;
        displayName: string | null;
    };
    game: {
        id: string;
        slug: string;
        title: string;
        coverUrl: string | null;
    };
}
export interface RatingSummary {
    id: string;
    userId: string;
    gameId: string;
    score: number;
    updatedAt: string;
}
export interface ListSummary {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    visibility: ListVisibility;
    itemCount: number;
    user: Pick<UserPublic, 'id' | 'username' | 'displayName'>;
}
/**
 * Community collection shape — returned by GET /lists/discovery.
 * Shaped for homepage mosaic card display.
 */
export interface DiscoveryCollection {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    gameCount: number;
    curator: {
        username: string;
        displayName: string;
    };
    covers: string[];
}
export interface GamesListResponse {
    data: GameSummary[];
    meta: {
        nextCursor: string | null;
        total?: number;
    };
}
