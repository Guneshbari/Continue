/**
 * Prisma CLI Seed Entry Point
 * Phase 2.2 — Canonical Fixture Infrastructure
 *
 * Usage:
 *   FIXTURE_SCENARIO=realistic pnpm --filter @continue/api db:seed
 *   FIXTURE_SCENARIO=minimal   pnpm --filter @continue/api db:seed
 *   FIXTURE_SCENARIO=stress_test pnpm --filter @continue/api db:seed
 *   FIXTURE_SCENARIO=broken_metadata pnpm --filter @continue/api db:seed
 *
 * This script bootstraps the NestJS DI context to run the FixtureLoaderService,
 * then layers seed users, ratings, reviews, and lists on top of the canonical games.
 *
 * RESET POLICY: The seed script deletes all rows in dependency order before loading,
 * ensuring a clean, deterministic state. Safe for dev and staging only.
 */

import { NestFactory } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaModule } from '../src/common/prisma/prisma.module'
import { PrismaService } from '../src/common/prisma/prisma.service'
import { FixturesModule } from '../src/modules/fixtures/fixtures.module'
import { FixtureLoaderService } from '../src/modules/fixtures/fixture-loader.service'

// ─── Minimal bootstrapable module ─────────────────────────────────────────────
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    FixturesModule,
  ],
})
class SeedModule {}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['log', 'warn', 'error'],
  })

  const prisma = app.get(PrismaService)
  const fixtureLoader = app.get(FixtureLoaderService)

  console.log('🌱 Continue — Canonical Fixture Seeder')
  console.log(`   Scenario: ${process.env.FIXTURE_SCENARIO ?? 'realistic'}`)
  console.log('')

  // ── 1. Full database reset (dependency-ordered) ───────────────────────────
  console.log('🧹 Resetting database...')
  await prisma.listItem.deleteMany()
  await prisma.list.deleteMany()
  await prisma.review.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.screenshot.deleteMany()
  await prisma.trailer.deleteMany()
  await prisma.gameGenre.deleteMany()
  await prisma.gamePlatform.deleteMany()
  await prisma.gameTag.deleteMany()
  await prisma.gameTheme.deleteMany()
  await prisma.gameDeveloper.deleteMany()
  await prisma.gamePublisher.deleteMany()
  await prisma.game.deleteMany()
  await prisma.mediaVariant.deleteMany()
  await prisma.mediaAsset.deleteMany()
  await prisma.genre.deleteMany()
  await prisma.platform.deleteMany()
  await prisma.theme.deleteMany()
  await prisma.developer.deleteMany()
  await prisma.publisher.deleteMany()
  await prisma.franchise.deleteMany()
  await prisma.tag.deleteMany()
  console.log('   Done.\n')

  // ── 2. Load canonical fixture scenario ────────────────────────────────────
  console.log('🎮 Loading game fixtures...')
  await fixtureLoader.load()
  console.log('')

  // ── 3. Seed community users ───────────────────────────────────────────────
  console.log('👥 Seeding users...')
  const passwordHash = await bcrypt.hash('password123', 12)

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@continue.gg',
      passwordHash,
      displayName: 'System Admin',
      bio: 'The platform administrator. Keeper of the lists.',
      role: 'ADMIN',
      isVerified: true,
    },
  })

  const alex = await prisma.user.create({
    data: {
      username: 'alex',
      email: 'alex@example.com',
      passwordHash,
      displayName: 'Alex Mercer',
      bio: '100% completionist. Soulslike fanatic. CRPG devotee.',
      role: 'USER',
      isVerified: true,
    },
  })

  const sarah = await prisma.user.create({
    data: {
      username: 'sarah',
      email: 'sarah@example.com',
      passwordHash,
      displayName: 'Sarah Voss',
      bio: 'Indie dev and speedrunner. Hates easy games.',
      role: 'USER',
      isVerified: true,
    },
  })

  const mika = await prisma.user.create({
    data: {
      username: 'mika',
      email: 'mika@example.com',
      passwordHash,
      displayName: 'Mika Reinholt',
      bio: 'Narrative-first. If the story is bad, the game is bad.',
      role: 'USER',
      isVerified: false,
    },
  })
  console.log('   Created: admin, alex, sarah, mika\n')

  // ── 4. Seed ratings and reviews on known slugs ────────────────────────────
  console.log('⭐ Seeding ratings and reviews...')
  const gameMap = await resolveGames(prisma, [
    'elden-ring',
    'disco-elysium',
    'hades',
    'baldurs-gate-3',
    'outer-wilds',
    'the-last-of-us-part-ii',
    'cyberpunk-2077',
    'returnal',
    'death-stranding',
  ])

  // Ratings
  const ratingsData = [
    // Elden Ring — high community rating
    { userId: alex.id, gameId: gameMap['elden-ring'], score: 10 },
    { userId: sarah.id, gameId: gameMap['elden-ring'], score: 9 },
    { userId: mika.id, gameId: gameMap['elden-ring'], score: 10 },
    // Disco Elysium
    { userId: alex.id, gameId: gameMap['disco-elysium'], score: 10 },
    { userId: mika.id, gameId: gameMap['disco-elysium'], score: 9 },
    // Hades
    { userId: sarah.id, gameId: gameMap['hades'], score: 9 },
    { userId: mika.id, gameId: gameMap['hades'], score: 10 },
    // Baldur's Gate 3
    { userId: alex.id, gameId: gameMap['baldurs-gate-3'], score: 10 },
    { userId: admin.id, gameId: gameMap['baldurs-gate-3'], score: 10 },
    // Outer Wilds
    { userId: mika.id, gameId: gameMap['outer-wilds'], score: 10 },
    // TLOU2
    { userId: mika.id, gameId: gameMap['the-last-of-us-part-ii'], score: 9 },
    { userId: sarah.id, gameId: gameMap['the-last-of-us-part-ii'], score: 8 },
    // Cyberpunk
    { userId: alex.id, gameId: gameMap['cyberpunk-2077'], score: 7 },
    { userId: admin.id, gameId: gameMap['cyberpunk-2077'], score: 8 },
    // Returnal
    { userId: sarah.id, gameId: gameMap['returnal'], score: 9 },
    // Death Stranding
    { userId: mika.id, gameId: gameMap['death-stranding'], score: 8 },
    { userId: admin.id, gameId: gameMap['death-stranding'], score: 6 },
  ]

  for (const r of ratingsData) {
    if (r.gameId) {
      await prisma.rating.create({ data: r })
    }
  }

  // Reviews (rich editorial body text)
  const reviewsData = [
    {
      userId: alex.id,
      gameId: gameMap['elden-ring'],
      title: 'The Open World RPG Perfected',
      body: `FromSoftware has done something extraordinary with Elden Ring. Every vista, every hidden dungeon, every impossible boss — it all coalesces into an experience that feels genuinely mythological in scale. I have put over 200 hours in and I still feel like I haven't seen everything. The collaboration with George R.R. Martin lends the world a weight that most fantasy games can only dream of. This is the new benchmark.`,
    },
    {
      userId: mika.id,
      gameId: gameMap['disco-elysium'],
      title: 'The Most Literary Game Ever Written',
      body: `Disco Elysium is not a game in the conventional sense. It is a novel that plays back. Every conversation, every internal monologue, every failed skill check feels authored with an intentionality that no other RPG approaches. The game understands failure as narrative fuel in a way that is genuinely novel. The political commentary is bracingly contemporary. I have thought about this game every day since I finished it.`,
    },
    {
      userId: sarah.id,
      gameId: gameMap['elden-ring'],
      title: 'A Breathtaking Achievement With Some Caveats',
      body: `There is genuinely nothing else like Elden Ring in terms of art direction and world-building. The open world feels earned rather than inflated. That said, the late-game difficulty spike is brutal and the camera during mounted combat still infuriates me. Minor complaints against something truly exceptional.`,
    },
    {
      userId: alex.id,
      gameId: gameMap['baldurs-gate-3'],
      title: 'The Best CRPG of the Decade',
      body: `Larian has achieved something that should have been impossible — a game that genuinely adapts to every decision you make in a way that feels authored rather than procedural. Every playthrough reveals something new. The companion writing is some of the finest in the medium. A deserving GOTY.`,
    },
    {
      userId: mika.id,
      gameId: gameMap['outer-wilds'],
      title: 'I Will Never Forget This Game',
      body: `Outer Wilds is a mystery that respects your intelligence and rewards genuine curiosity. It is one of the very few games where the act of discovery — not progression or loot — is the entire emotional payload. The ending broke me. Do not look anything up. Just play it.`,
    },
    {
      userId: mika.id,
      gameId: gameMap['the-last-of-us-part-ii'],
      title: 'Uncomfortable and Necessary',
      body: `Neil Druckmann made a game about the ugliness of revenge. The discomfort you feel is the point. TLOU2 is the rare blockbuster that asks you to sit with your discomfort rather than absolve it. The animation and environmental storytelling are unmatched. Some of the best gameplay design in any third-person action game.`,
    },
  ]

  for (const r of reviewsData) {
    if (r.gameId) {
      await prisma.review.create({ data: r })
    }
  }
  console.log('   Done.\n')

  // ── 5. Seed lists ──────────────────────────────────────────────────────────
  console.log('📚 Seeding lists...')

  if (gameMap['elden-ring'] && gameMap['baldurs-gate-3'] && gameMap['disco-elysium']) {
    const alexFavs = await prisma.list.create({
      data: {
        userId: alex.id,
        slug: 'all-time-favorites',
        title: 'All-Time Favorites',
        description: 'Games that permanently changed the way I think about the medium.',
        visibility: 'PUBLIC',
      },
    })
    await prisma.listItem.createMany({
      data: [
        { listId: alexFavs.id, gameId: gameMap['elden-ring']!, position: 1 },
        { listId: alexFavs.id, gameId: gameMap['baldurs-gate-3']!, position: 2 },
        { listId: alexFavs.id, gameId: gameMap['disco-elysium']!, position: 3 },
      ],
    })
  }

  if (gameMap['outer-wilds'] && gameMap['disco-elysium'] && gameMap['the-last-of-us-part-ii']) {
    const mikaList = await prisma.list.create({
      data: {
        userId: mika.id,
        slug: 'narrative-landmarks',
        title: 'Narrative Landmarks',
        description: 'Games where the writing elevated everything else.',
        visibility: 'PUBLIC',
      },
    })
    await prisma.listItem.createMany({
      data: [
        { listId: mikaList.id, gameId: gameMap['outer-wilds']!, position: 1 },
        { listId: mikaList.id, gameId: gameMap['disco-elysium']!, position: 2 },
        { listId: mikaList.id, gameId: gameMap['the-last-of-us-part-ii']!, position: 3 },
      ],
    })
  }

  if (gameMap['returnal'] && gameMap['hades']) {
    const sarahList = await prisma.list.create({
      data: {
        userId: sarah.id,
        slug: 'roguelites-that-matter',
        title: 'Roguelites That Actually Matter',
        description: 'The rare roguelites that justify the genre.',
        visibility: 'PUBLIC',
      },
    })
    await prisma.listItem.createMany({
      data: [
        { listId: sarahList.id, gameId: gameMap['hades']!, position: 1 },
        { listId: sarahList.id, gameId: gameMap['returnal']!, position: 2 },
      ],
    })
  }

  console.log('   Done.\n')

  console.log('✅ Seed complete.')
  console.log(`   ${Object.keys(gameMap).filter((k) => gameMap[k]).length} games loaded`)
  console.log('   4 users created (admin, alex, sarah, mika)')
  console.log('   Ratings, reviews, and lists seeded.\n')

  await app.close()
}

// ─── Helper: resolve game IDs by slug ────────────────────────────────────────

async function resolveGames(
  prisma: PrismaService,
  slugs: string[],
): Promise<Record<string, string | undefined>> {
  const games = await prisma.game.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  })
  const map: Record<string, string | undefined> = {}
  for (const g of games) {
    map[g.slug] = g.id
  }
  // Fill undefined for slugs not found (scenario might not include all games)
  for (const slug of slugs) {
    if (!(slug in map)) {
      map[slug] = undefined
    }
  }
  return map
}

main().catch((e) => {
  console.error('❌ Seed failed:', e)
  process.exit(1)
})
