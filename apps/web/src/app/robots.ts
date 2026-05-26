import type { MetadataRoute } from 'next'

/**
 * Crawler Governance Directives (robots.txt)
 * Guides search engine indexers to focus crawl budgets on high-value public pages.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://continue.app'

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/discover',
        '/discover/trending',
        '/discover/top-rated',
        '/discover/new-releases',
        '/discover/upcoming',
        '/games',
        '/games/',
        '/lists',
        '/lists/',
        '/u/',
      ],
      disallow: [
        '/api/',
        '/admin/',
        '/settings/',
        '/login',
        '/register',
        '/*/edit',
        '/search', // Prevent indexing empty search parameter pages
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
