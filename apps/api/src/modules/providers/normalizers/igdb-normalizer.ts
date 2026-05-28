import { ProviderGame, ProviderTrailer } from '../contracts/provider.contracts'

/**
 * Interface representing the raw, highly nested structure returned by the IGDB v4 API.
 */
export interface RawIgdbGame {
  id: number
  name: string
  slug: string
  summary?: string | null
  storyline?: string | null
  first_release_date?: number | null // Unix timestamp in seconds
  rating?: number | null
  rating_count?: number | null
  cover?: { id: number; url: string } | null
  artworks?: Array<{ id: number; url: string }> | null
  screenshots?: Array<{ id: number; url: string }> | null
  genres?: Array<{ id: number; name: string; slug: string }> | null
  platforms?: Array<{ id: number; name: string; slug: string }> | null
  themes?: Array<{ id: number; name: string; slug: string }> | null
  involved_companies?: Array<{
    id: number
    developer: boolean
    publisher: boolean
    company: { id: number; name: string; slug: string }
  }> | null
  videos?: Array<{ id: number; video_id: string; name?: string | null }> | null
  franchises?: Array<{ id: number; name: string; slug: string }> | null
}

/**
 * Normalize a relative IGDB image URL into an absolute, high-resolution URL.
 * Example input: "//images.igdb.com/igdb/image/upload/t_thumb/co1rgi.jpg"
 * Example output: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.jpg"
 */
export function normalizeIgdbImageUrl(url: string | undefined | null, size: 't_cover_big' | 't_screenshot_huge' = 't_cover_big'): string | null {
  if (!url) return null
  
  // Prefix with https: if starting with double slash
  const absoluteUrl = url.startsWith('//') ? `https:${url}` : url
  
  // Replace standard thumbnail size with the target high-resolution size
  return absoluteUrl.replace('/t_thumb/', `/${size}/`)
}

/**
 * Normalizes a raw IGDB game response payload into the canonical ProviderGame structure.
 * Robustly tolerates incomplete/missing metadata and resolves nested relationships.
 */
export function normalizeIgdbGame(raw: RawIgdbGame): ProviderGame {
  // ── 1. Image Resolution ────────────────────────────────────────────────────
  const coverUrl = normalizeIgdbImageUrl(raw.cover?.url, 't_cover_big')
  
  // Backdrop resolution: prefer first artwork, fallback to first screenshot, or null
  const firstArtworkUrl = raw.artworks?.[0]?.url
  const firstScreenshotUrl = raw.screenshots?.[0]?.url
  const backdropUrl = normalizeIgdbImageUrl(firstArtworkUrl ?? firstScreenshotUrl, 't_screenshot_huge')

  // ── 2. Taxonomy Names extraction ───────────────────────────────────────────
  const genres = (raw.genres ?? []).map((g) => g.slug).filter(Boolean)
  const platforms = (raw.platforms ?? []).map((p) => p.slug).filter(Boolean)
  const themes = (raw.themes ?? []).map((t) => t.slug).filter(Boolean)

  // ── 3. Involved Companies categorization ────────────────────────────────────
  const developers: string[] = []
  const publishers: string[] = []

  if (raw.involved_companies) {
    for (const entry of raw.involved_companies) {
      if (!entry.company?.name) continue
      if (entry.developer) {
        developers.push(entry.company.name)
      }
      if (entry.publisher) {
        publishers.push(entry.company.name)
      }
    }
  }

  // ── 4. Franchise Resolution ────────────────────────────────────────────────
  const franchise = raw.franchises?.[0]?.name ?? null

  // ── 5. Screenshots Resolution ──────────────────────────────────────────────
  const screenshots = (raw.screenshots ?? [])
    .map((s) => normalizeIgdbImageUrl(s.url, 't_screenshot_huge'))
    .filter((url): url is string => url !== null)

  // ── 6. Videos / Trailers Resolution ────────────────────────────────────────
  const trailers: ProviderTrailer[] = (raw.videos ?? [])
    .filter((v) => typeof v.video_id === 'string' && v.video_id.trim().length > 0)
    .map((v) => ({
      youtubeId: v.video_id,
      name: v.name ?? 'Gameplay Video',
    }))

  // ── 7. Date parsing ────────────────────────────────────────────────────────
  const releaseDate = raw.first_release_date
    ? new Date(raw.first_release_date * 1000)
    : null

  return {
    externalId: raw.id,
    slug: raw.slug,
    title: raw.name,
    description: raw.summary ?? null,
    summary: raw.summary ?? null,
    storyline: raw.storyline ?? null,
    releaseDate,
    igdbRating: raw.rating ?? null,
    igdbRatingCount: raw.rating_count ?? null,
    coverUrl,
    backdropUrl,
    genres,
    platforms,
    themes,
    developers,
    publishers,
    franchise,
    screenshots,
    trailers,
  }
}
