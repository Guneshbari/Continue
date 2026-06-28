import type { MetadataRoute } from 'next'
import { gamesApi } from '@/lib/api/games'

/**
 * Dynamic SEO Sitemap Aggregator
 * Generates dynamic crawl pathways for search engine indexing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://continue.app'

  // ─── 1. Static Platform Hubs ───────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/discover/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/discover/top-rated`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/discover/new-releases`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/discover/upcoming`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // ─── 2. Dynamic Games ──────────────────────────────────────────────────────
  let gameRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await gamesApi.list({ limit: 100, sort: 'trending' })
    if (res && Array.isArray(res.data)) {
      gameRoutes = res.data.map((game) => ({
        url: `${baseUrl}/games/${game.slug}`,
        lastModified: game.releaseDate ? new Date(game.releaseDate) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }
  } catch (err) {
    console.warn('Sitemap dynamic game generation fallback active:', err)
  }

  return [...staticRoutes, ...gameRoutes]
}
