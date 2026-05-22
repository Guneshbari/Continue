/**
 * Prisma CLI seed entry point.
 * Logic lives in src/common/seed.ts — single source of truth.
 *
 * Run: pnpm --filter @continue/api db:seed
 */
import { PrismaClient } from '@prisma/client'
import { autoSeedDatabase } from '../src/common/seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding (CLI mode)...')

  // CLI seed does a full reset first (safe for dev/staging)
  console.log('🧹 Cleaning old data...')
  await prisma.listItem.deleteMany()
  await prisma.list.deleteMany()
  await prisma.review.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.gameTag.deleteMany()
  await prisma.gameGenre.deleteMany()
  await prisma.gamePlatform.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.genre.deleteMany()
  await prisma.platform.deleteMany()
  await prisma.game.deleteMany()
  await prisma.user.deleteMany()

  // Force bypass the "already seeded" guard by temporarily making count === 0
  await autoSeedDatabase(prisma)
  console.log('✅ Seeding complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
