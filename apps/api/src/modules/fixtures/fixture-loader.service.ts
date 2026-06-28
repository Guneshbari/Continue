import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { ScenarioRegistryService } from './scenario-registry.service'
import type { FixtureGame } from './fixture.types'

/**
 * FixtureLoaderService
 *
 * Deterministically populates the database with a canonical fixture scenario.
 * All operations use upsert to remain idempotent — safe to call multiple times.
 *
 * Architecture:
 * - Games are upserted by slug (stable identity anchor).
 * - Supporting entities (Genre, Platform, Theme, Developer, Publisher, Franchise) are
 *   upserted by slug/name before game upserts to satisfy FK constraints.
 * - MediaAssets are created for covers, backdrops, and screenshots if a rawUrl exists.
 * - Join tables (GameGenre, GamePlatform, etc.) are deleted then re-inserted per game
 *   to guarantee deterministic relational state across repeated loads.
 */
@Injectable()
export class FixtureLoaderService {
  private readonly logger = new Logger(FixtureLoaderService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ScenarioRegistryService,
  ) {}

  async load(): Promise<void> {
    const scenario = this.registry.getScenario()
    this.logger.log(`Loading fixture scenario: ${scenario}`)

    const games = this.registry.resolveDataset(scenario)
    this.logger.log(`Seeding ${games.length} game(s) for scenario "${scenario}"`)

    // ── 1. Upsert all supporting taxonomy entities first ──────────────────────
    await this.upsertTaxonomies(games)

    // ── 2. Upsert each game with its full relational tree ─────────────────────
    for (const game of games) {
      await this.upsertGame(game)
    }

    this.logger.log(`Fixture scenario "${scenario}" loaded successfully.`)
  }

  // ─── Taxonomy Pre-seeding ─────────────────────────────────────────────────

  private async upsertTaxonomies(games: FixtureGame[]): Promise<void> {
    // Collect unique slugs/names from all games in this dataset
    const genres = new Map<string, string>()
    const platforms = new Map<string, string>()
    const themes = new Map<string, string>()
    const developers = new Set<string>()
    const publishers = new Set<string>()
    const franchises = new Set<string>()

    for (const game of games) {
      for (const slug of game.genres) {
        genres.set(slug, this.slugToName(slug))
      }
      for (const slug of game.platforms) {
        platforms.set(slug, this.slugToName(slug))
      }
      for (const slug of game.themes) {
        themes.set(slug, this.slugToName(slug))
      }
      for (const name of game.developers) {
        developers.add(name)
      }
      for (const name of game.publishers) {
        publishers.add(name)
      }
      if (game.franchise) franchises.add(game.franchise)
    }

    // Upsert in parallel batches
    await Promise.all([
      ...Array.from(genres.entries()).map(([slug, name]) =>
        this.prisma.genre.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
        }),
      ),
      ...Array.from(platforms.entries()).map(([slug, name]) =>
        this.prisma.platform.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
        }),
      ),
      ...Array.from(themes.entries()).map(([slug, name]) =>
        this.prisma.theme.upsert({
          where: { slug },
          update: { name },
          create: { slug, name },
        }),
      ),
      ...Array.from(developers).map((name) =>
        this.prisma.developer.upsert({
          where: { slug: this.nameToSlug(name) },
          update: { name },
          create: { slug: this.nameToSlug(name), name },
        }),
      ),
      ...Array.from(publishers).map((name) =>
        this.prisma.publisher.upsert({
          where: { slug: this.nameToSlug(name) },
          update: { name },
          create: { slug: this.nameToSlug(name), name },
        }),
      ),
      ...Array.from(franchises).map((name) =>
        this.prisma.franchise.upsert({
          where: { slug: this.nameToSlug(name) },
          update: { name },
          create: { slug: this.nameToSlug(name), name },
        }),
      ),
    ])
  }

  // ─── Game Upsert ──────────────────────────────────────────────────────────

  private async upsertGame(fixture: FixtureGame): Promise<void> {
    // ── a. Resolve cover MediaAsset ──────────────────────────────────────────
    let coverId: string | null = null
    if (fixture.coverUrl) {
      const coverAsset = await this.prisma.mediaAsset.upsert({
        where: { hash: this.hashUrl(fixture.coverUrl) },
        update: {},
        create: {
          rawUrl: fixture.coverUrl,
          hash: this.hashUrl(fixture.coverUrl),
          optimized: false,
        },
      })
      coverId = coverAsset.id
    }

    // ── b. Resolve backdrop MediaAsset ───────────────────────────────────────
    let backdropId: string | null = null
    if (fixture.backdropUrl) {
      const backdropAsset = await this.prisma.mediaAsset.upsert({
        where: { hash: this.hashUrl(fixture.backdropUrl) },
        update: {},
        create: {
          rawUrl: fixture.backdropUrl,
          hash: this.hashUrl(fixture.backdropUrl),
          optimized: false,
        },
      })
      backdropId = backdropAsset.id
    }

    // ── c. Resolve Franchise ID ───────────────────────────────────────────────
    let franchiseId: string | null = null
    if (fixture.franchise) {
      const fr = await this.prisma.franchise.findUnique({
        where: { slug: this.nameToSlug(fixture.franchise) },
      })
      franchiseId = fr?.id ?? null
    }

    // ── d. Upsert the Game ────────────────────────────────────────────────────
    const game = await this.prisma.game.upsert({
      where: { slug: fixture.slug },
      update: {
        title: fixture.title,
        description: fixture.description,
        summary: fixture.summary,
        storyline: fixture.storyline,
        releaseDate: fixture.releaseDate ? new Date(fixture.releaseDate) : null,
        igdbId: fixture.igdbId,
        igdbRating: fixture.igdbRating,
        igdbRatingCount: fixture.igdbRatingCount,
        status: fixture.status,
        coverId,
        backdropId,
        franchiseId,
        avgRating: fixture.avgRating,
        ratingCount: fixture.ratingCount,
      },
      create: {
        slug: fixture.slug,
        title: fixture.title,
        description: fixture.description,
        summary: fixture.summary,
        storyline: fixture.storyline,
        releaseDate: fixture.releaseDate ? new Date(fixture.releaseDate) : null,
        igdbId: fixture.igdbId,
        igdbRating: fixture.igdbRating,
        igdbRatingCount: fixture.igdbRatingCount,
        status: fixture.status,
        coverId,
        backdropId,
        franchiseId,
        avgRating: fixture.avgRating,
        ratingCount: fixture.ratingCount,
      },
    })

    // ── e. Sync join tables (delete + re-insert for determinism) ─────────────
    await this.syncJoinTables(game.id, fixture)

    // ── f. Sync Screenshots ───────────────────────────────────────────────────
    await this.syncScreenshots(game.id, fixture.screenshots)

    // ── g. Sync Trailers ──────────────────────────────────────────────────────
    await this.syncTrailers(game.id, fixture.trailers)
  }

  // ─── Join Table Sync ──────────────────────────────────────────────────────

  private async syncJoinTables(gameId: string, fixture: FixtureGame): Promise<void> {
    // Delete then re-insert all join rows — deterministic across repeated loads
    await Promise.all([
      this.prisma.gameGenre.deleteMany({ where: { gameId } }),
      this.prisma.gamePlatform.deleteMany({ where: { gameId } }),
      this.prisma.gameTheme.deleteMany({ where: { gameId } }),
      this.prisma.gameDeveloper.deleteMany({ where: { gameId } }),
      this.prisma.gamePublisher.deleteMany({ where: { gameId } }),
    ])

    // Resolve entity IDs in parallel
    const [genres, platforms, themes, developers, publishers] = await Promise.all([
      this.prisma.genre.findMany({
        where: { slug: { in: fixture.genres } },
        select: { id: true },
      }),
      this.prisma.platform.findMany({
        where: { slug: { in: fixture.platforms } },
        select: { id: true },
      }),
      this.prisma.theme.findMany({
        where: { slug: { in: fixture.themes } },
        select: { id: true },
      }),
      this.prisma.developer.findMany({
        where: { slug: { in: fixture.developers.map(this.nameToSlug) } },
        select: { id: true },
      }),
      this.prisma.publisher.findMany({
        where: { slug: { in: fixture.publishers.map(this.nameToSlug) } },
        select: { id: true },
      }),
    ])

    // Insert all join rows
    await Promise.all([
      ...genres.map((g) => this.prisma.gameGenre.create({ data: { gameId, genreId: g.id } })),
      ...platforms.map((p) =>
        this.prisma.gamePlatform.create({ data: { gameId, platformId: p.id } }),
      ),
      ...themes.map((t) => this.prisma.gameTheme.create({ data: { gameId, themeId: t.id } })),
      ...developers.map((d) =>
        this.prisma.gameDeveloper.create({ data: { gameId, developerId: d.id } }),
      ),
      ...publishers.map((p) =>
        this.prisma.gamePublisher.create({ data: { gameId, publisherId: p.id } }),
      ),
    ])
  }

  // ─── Screenshot Sync ─────────────────────────────────────────────────────

  private async syncScreenshots(gameId: string, urls: string[]): Promise<void> {
    // Delete existing then re-insert for determinism
    await this.prisma.screenshot.deleteMany({ where: { gameId } })

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      if (!url) continue

      const asset = await this.prisma.mediaAsset.upsert({
        where: { hash: this.hashUrl(url) },
        update: {},
        create: {
          rawUrl: url,
          hash: this.hashUrl(url),
          optimized: false,
        },
      })

      await this.prisma.screenshot.create({
        data: {
          gameId,
          assetId: asset.id,
          position: i,
        },
      })
    }
  }

  // ─── Trailer Sync ────────────────────────────────────────────────────────

  private async syncTrailers(
    gameId: string,
    trailers: Array<{ youtubeId: string; name: string | null }>,
  ): Promise<void> {
    await this.prisma.trailer.deleteMany({ where: { gameId } })

    for (const trailer of trailers) {
      await this.prisma.trailer.create({
        data: {
          gameId,
          youtubeId: trailer.youtubeId,
          name: trailer.name,
        },
      })
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Convert slug like "role-playing-game" to "Role Playing Game".
   * Used when fixture data provides slug-only taxonomy entries.
   */
  private slugToName(slug: string): string {
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  /**
   * Convert a company name like "CD Projekt Red" to "cd-projekt-red".
   * Strips non-alphanumeric chars, collapses spaces to hyphens.
   */
  private nameToSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 120) // guard against slug overflows from stress test names
  }

  /**
   * Deterministic "hash" for MediaAsset deduplication.
   * Uses the URL itself as the hash key (simplified — no crypto dependency).
   * In production, replace with actual SHA-256 of downloaded image bytes.
   */
  private hashUrl(url: string): string {
    return `fixture:${url}`
  }
}
