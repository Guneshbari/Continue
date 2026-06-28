import type { GameDetail, GameSummary } from '@continue/types'

// ─── Static seed data — replaced by API calls in Phase 3 ─────────────────────

export const FEATURED_GAMES: GameDetail[] = [
  {
    id: 'clx1',
    slug: 'elden-ring',
    title: 'Elden Ring',
    description:
      'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scs9vk.webp',
    releaseDate: '2022-02-25',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    avgRating: 9.4,
    ratingCount: 84201,
    genres: [
      { id: 'g1', slug: 'action-rpg', name: 'Action RPG' },
      { id: 'g2', slug: 'open-world', name: 'Open World' },
    ],
    platforms: [
      { id: 'p1', slug: 'pc', name: 'PC' },
      { id: 'p2', slug: 'ps5', name: 'PS5' },
    ],
    tags: [{ id: 't1', slug: 'soulslike', name: 'Soulslike' }],
  },
  {
    id: 'clx2',
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    description:
      'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6li1.webp',
    bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sctc2q.webp',
    releaseDate: '2023-08-03',
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    avgRating: 9.6,
    ratingCount: 61500,
    genres: [
      { id: 'g3', slug: 'rpg', name: 'RPG' },
      { id: 'g4', slug: 'strategy', name: 'Strategy' },
    ],
    platforms: [{ id: 'p1', slug: 'pc', name: 'PC' }],
    tags: [{ id: 't2', slug: 'dnd', name: 'D&D' }],
  },
  {
    id: 'clx3',
    slug: 'hades-ii',
    title: 'Hades II',
    description:
      'The next rogue-like game from the creators of the award-winning Hades. Battle out of the Underworld as the immortal Princess of the Underworld.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7hxj.webp',
    bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sctu71.webp',
    releaseDate: '2024-05-06',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    avgRating: 9.1,
    ratingCount: 21000,
    genres: [
      { id: 'g5', slug: 'rogue-like', name: 'Rogue-like' },
      { id: 'g1', slug: 'action-rpg', name: 'Action RPG' },
    ],
    platforms: [{ id: 'p1', slug: 'pc', name: 'PC' }],
    tags: [],
  },
]

export const TRENDING_GAMES: GameSummary[] = FEATURED_GAMES.map(
  ({ tags: _t, description: _d, bannerUrl: _b, developer: _dev, publisher: _pub, ...rest }) => rest,
)

export const NEW_RELEASES: GameSummary[] = [
  {
    id: 'clx4',
    slug: 'hollow-knight-silksong',
    title: 'Hollow Knight: Silksong',
    coverUrl: null,
    releaseDate: '2024-06-01',
    avgRating: null,
    ratingCount: 0,
    genres: [{ id: 'g6', slug: 'metroidvania', name: 'Metroidvania' }],
    platforms: [{ id: 'p1', slug: 'pc', name: 'PC' }],
  },
  {
    id: 'clx5',
    slug: 'black-myth-wukong',
    title: 'Black Myth: Wukong',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
    releaseDate: '2024-08-20',
    avgRating: 8.7,
    ratingCount: 42000,
    genres: [{ id: 'g1', slug: 'action-rpg', name: 'Action RPG' }],
    platforms: [
      { id: 'p1', slug: 'pc', name: 'PC' },
      { id: 'p2', slug: 'ps5', name: 'PS5' },
    ],
  },
  ...TRENDING_GAMES.slice(0, 4),
]

export const TOP_RATED: GameSummary[] = [...TRENDING_GAMES].sort(
  (a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0),
)

// ─── Featured Reviews seed — editorial picks for homepage ─────────────────────

export type SeedReview = {
  id: string
  body: string
  rating: number
  game: { title: string; slug: string; coverUrl: string | null }
  user: { username: string; displayName: string }
}

export const FEATURED_REVIEWS: SeedReview[] = [
  {
    id: 'rev1',
    body: "Elden Ring is the culmination of FromSoftware's decade of craft. Every fog gate hides discovery. Every death teaches. The open world doesn't dilute the formula — it amplifies it into something transcendent.",
    rating: 9.4,
    game: {
      title: 'Elden Ring',
      slug: 'elden-ring',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    },
    user: { username: 'margit_slayer', displayName: 'Margit Slayer' },
  },
  {
    id: 'rev2',
    body: "Baldur's Gate 3 is a miracle. 174 hours in and I'm still finding quests I missed. Larian built something that respects player intelligence and rewards curiosity at every turn.",
    rating: 9.6,
    game: {
      title: "Baldur's Gate 3",
      slug: 'baldurs-gate-3',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6li1.webp',
    },
    user: { username: 'astarion_fan', displayName: 'Astarion Fan' },
  },
  {
    id: 'rev3',
    body: "Hades II proves the formula wasn't a fluke. Melinoe moves with new weight. The added mechanics layer beautifully without bloat. Supergiant keeps raising their own bar.",
    rating: 9.1,
    game: {
      title: 'Hades II',
      slug: 'hades-ii',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7hxj.webp',
    },
    user: { username: 'chronos_runner', displayName: 'Chronos Runner' },
  },
]

// ─── Community Collections seed — curated lists for homepage ──────────────────

export type SeedCollection = {
  id: string
  title: string
  description: string
  curator: { username: string; displayName: string }
  gameCount: number
  covers: string[]
}

export const COMMUNITY_COLLECTIONS: SeedCollection[] = [
  {
    id: 'col1',
    title: 'Essential Soulslike Journey',
    description:
      'The definitive path through the genre — ranked by accessibility for newcomers and depth for veterans.',
    curator: { username: 'tarnished_scholar', displayName: 'Tarnished Scholar' },
    gameCount: 12,
    covers: [
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co7hxj.webp',
    ],
  },
  {
    id: 'col2',
    title: 'Modern RPG Masterpieces',
    description:
      'Games that redefined what a role-playing experience can be in the last five years.',
    curator: { username: 'quest_archivist', displayName: 'Quest Archivist' },
    gameCount: 8,
    covers: [
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co6li1.webp',
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co7hxj.webp',
    ],
  },
  {
    id: 'col3',
    title: 'Indie Gems Worth Your Time',
    description:
      'Small teams, giant vision. Each game on this list proves that budget is no barrier to brilliance.',
    curator: { username: 'pixel_hunter', displayName: 'Pixel Hunter' },
    gameCount: 15,
    covers: [
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co7hxj.webp',
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co6li1.webp',
    ],
  },
]

/** All seed games with full GameDetail shape — keyed by slug */
const ALL_SEED_DETAILS: Record<string, GameDetail> = Object.fromEntries(
  FEATURED_GAMES.map((g) => [g.slug, g]),
)

/** Find a seed game by slug or id (for detail page fallback) */
export function findSeedGame(slugOrId: string): GameDetail | undefined {
  return ALL_SEED_DETAILS[slugOrId] ?? FEATURED_GAMES.find((g) => g.id === slugOrId)
}
