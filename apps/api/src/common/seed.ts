import type { PrismaService } from './prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

export async function autoSeedDatabase(prisma: PrismaService) {
  try {
    const gameCount = await prisma.game.count()
    if (gameCount > 0) {
      console.log('🌱 Database already has games. Skipping auto-seed.')
      return
    }

    console.log('🌱 Running auto-seed since database is empty...')
    
    // Create Users
    const passwordHash = await bcrypt.hash('password123', 12)

    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@continue.gg',
        passwordHash,
        displayName: 'System Admin',
        bio: 'Lover of all things retro and RPGs.',
        role: 'ADMIN',
        isVerified: true,
      },
    })

    const alexUser = await prisma.user.upsert({
      where: { username: 'alex' },
      update: {},
      create: {
        username: 'alex',
        email: 'alex@example.com',
        passwordHash,
        displayName: 'Alex Mercer',
        bio: '100% completionist. Soulslike fanatic.',
        role: 'USER',
        isVerified: true,
      },
    })

    const sarahUser = await prisma.user.upsert({
      where: { username: 'sarah' },
      update: {},
      create: {
        username: 'sarah',
        email: 'sarah@example.com',
        passwordHash,
        displayName: 'Sarah Connor',
        bio: 'Indie dev and speedrunner.',
        role: 'USER',
        isVerified: false,
      },
    })

    // Create Genres
    const genreList = [
      { slug: 'action-rpg', name: 'Action RPG' },
      { slug: 'open-world', name: 'Open World' },
      { slug: 'rpg', name: 'RPG' },
      { slug: 'strategy', name: 'Strategy' },
      { slug: 'rogue-like', name: 'Rogue-like' },
      { slug: 'metroidvania', name: 'Metroidvania' },
      { slug: 'adventure', name: 'Adventure' },
      { slug: 'action', name: 'Action' },
    ]
    const genres: Record<string, any> = {}
    for (const g of genreList) {
      genres[g.slug] = await prisma.genre.upsert({
        where: { slug: g.slug },
        update: {},
        create: g,
      })
    }

    // Create Platforms
    const platformList = [
      { slug: 'pc', name: 'PC' },
      { slug: 'ps5', name: 'PS5' },
      { slug: 'xbox-series-x', name: 'Xbox Series X' },
      { slug: 'switch', name: 'Nintendo Switch' },
    ]
    const platforms: Record<string, any> = {}
    for (const p of platformList) {
      platforms[p.slug] = await prisma.platform.upsert({
        where: { slug: p.slug },
        update: {},
        create: p,
      })
    }

    // Create Tags
    const tagList = [
      { slug: 'soulslike', name: 'Soulslike', approved: true },
      { slug: 'dnd', name: 'D&D', approved: true },
      { slug: 'coop', name: 'Co-op', approved: true },
      { slug: 'difficult', name: 'Difficult', approved: true },
      { slug: 'story-rich', name: 'Story Rich', approved: true },
    ]
    const tags: Record<string, any> = {}
    for (const t of tagList) {
      tags[t.slug] = await prisma.tag.upsert({
        where: { slug: t.slug },
        update: {},
        create: t,
      })
    }

    // Create Games
    const gamesData = [
      {
        slug: 'elden-ring',
        title: 'Elden Ring',
        description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scs9vk.webp',
        releaseDate: new Date('2022-02-25'),
        developer: 'FromSoftware',
        publisher: 'Bandai Namco',
        avgRating: 9.4,
        ratingCount: 3,
        genres: ['action-rpg', 'open-world'],
        platforms: ['pc', 'ps5', 'xbox-series-x'],
        tags: ['soulslike', 'difficult'],
      },
      {
        slug: 'baldurs-gate-3',
        title: "Baldur's Gate 3",
        description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6li1.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sctc2q.webp',
        releaseDate: new Date('2023-08-03'),
        developer: 'Larian Studios',
        publisher: 'Larian Studios',
        avgRating: 9.6,
        ratingCount: 2,
        genres: ['rpg', 'strategy'],
        platforms: ['pc', 'ps5', 'xbox-series-x'],
        tags: ['dnd', 'story-rich'],
      },
      {
        slug: 'hades-ii',
        title: 'Hades II',
        description: 'The next rogue-like game from the creators of the award-winning Hades. Battle out of the Underworld as the immortal Princess of the Underworld.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7hxj.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sctu71.webp',
        releaseDate: new Date('2024-05-06'),
        developer: 'Supergiant Games',
        publisher: 'Supergiant Games',
        avgRating: 9.1,
        ratingCount: 1,
        genres: ['rogue-like', 'action-rpg'],
        platforms: ['pc'],
        tags: ['difficult', 'story-rich'],
      },
      {
        slug: 'hollow-knight-silksong',
        title: 'Hollow Knight: Silksong',
        description: 'Play as Hornet, princess-protector of Hallownest, and adventure through a whole new kingdom ruled by silk and song!',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7h.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc9f1u.webp',
        releaseDate: new Date('2026-06-01'),
        developer: 'Team Cherry',
        publisher: 'Team Cherry',
        avgRating: null,
        ratingCount: 0,
        genres: ['metroidvania', 'adventure'],
        platforms: ['pc', 'ps5', 'xbox-series-x', 'switch'],
        tags: ['difficult'],
      },
      {
        slug: 'black-myth-wukong',
        title: 'Black Myth: Wukong',
        description: 'Black Myth: Wukong is an action RPG rooted in Chinese mythology. You shall set out as the Destined One to venture into the challenges and marvels ahead, to uncover the obscured truth beneath the veil of a glorious legend from the past.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scv3p9.webp',
        releaseDate: new Date('2024-08-20'),
        developer: 'Game Science',
        publisher: 'Game Science',
        avgRating: 8.7,
        ratingCount: 1,
        genres: ['action-rpg'],
        platforms: ['pc', 'ps5'],
        tags: ['difficult'],
      },
    ]

    const games: Record<string, any> = {}

    for (const gameInfo of gamesData) {
      const { genres: gSlugs, platforms: pSlugs, tags: tSlugs, ...rest } = gameInfo
      
      const createdGame = await prisma.game.create({
        data: {
          ...rest,
          genres: {
            create: gSlugs.map((slug) => ({
              genre: { connect: { id: genres[slug].id } },
            })),
          },
          platforms: {
            create: pSlugs.map((slug) => ({
              platform: { connect: { id: platforms[slug].id } },
            })),
          },
          tags: {
            create: tSlugs.map((slug) => ({
              tag: { connect: { id: tags[slug].id } },
            })),
          },
        },
      })
      games[gameInfo.slug] = createdGame
    }

    // Elden Ring Reviews
    await prisma.rating.create({
      data: { userId: alexUser.id, gameId: games['elden-ring'].id, score: 10 },
    })
    await prisma.review.create({
      data: {
        userId: alexUser.id,
        gameId: games['elden-ring'].id,
        title: 'Masterpiece of modern game design',
        body: 'FromSoftware has done it again. The level of detail and sheer scale of the world is staggering. Every corner holds a secret, and the open-world freedom combined with the classic souls gameplay formula is a match made in heaven. Absolute masterpiece.',
      },
    })

    await prisma.rating.create({
      data: { userId: sarahUser.id, gameId: games['elden-ring'].id, score: 9 },
    })
    await prisma.review.create({
      data: {
        userId: sarahUser.id,
        gameId: games['elden-ring'].id,
        title: 'Incredible but punishing',
        body: 'A truly breathtaking open world with unmatched art direction. The difficulty is intense, but the game offers enough tools (like spirit ashes) to let anyone overcome the challenges if they persevere.',
      },
    })

    // Baldurs Gate 3 Reviews
    await prisma.rating.create({
      data: { userId: alexUser.id, gameId: games['baldurs-gate-3'].id, score: 10 },
    })
    await prisma.review.create({
      data: {
        userId: alexUser.id,
        gameId: games['baldurs-gate-3'].id,
        title: 'The best CRPG of all time',
        body: 'I have never played a game with this much player agency. Every decision feels impactful, the cast of characters is incredibly written, and the turn-based combat is deeply tactical and fun. It feels like an actual D&D session come to life.',
      },
    })

    // Create Lists
    const alexBacklogList = await prisma.list.create({
      data: {
        userId: alexUser.id,
        slug: 'backlog',
        title: 'My Game Backlog',
        description: 'Games I need to play and complete soon!',
        visibility: 'PUBLIC',
      },
    })

    await prisma.listItem.create({
      data: {
        listId: alexBacklogList.id,
        gameId: games['hades-ii'].id,
        position: 1,
        note: 'Need to get around to playing the early access build.',
      },
    })

    await prisma.listItem.create({
      data: {
        listId: alexBacklogList.id,
        gameId: games['black-myth-wukong'].id,
        position: 2,
        note: 'Looks absolutely gorgeous. Heard the combat is excellent.',
      },
    })

    const adminFavsList = await prisma.list.create({
      data: {
        userId: adminUser.id,
        slug: 'favorites',
        title: 'All-Time Favorites',
        description: 'The absolute greatest games ever made.',
        visibility: 'PUBLIC',
      },
    })

    await prisma.listItem.create({
      data: {
        listId: adminFavsList.id,
        gameId: games['elden-ring'].id,
        position: 1,
      },
    })

    await prisma.listItem.create({
      data: {
        listId: adminFavsList.id,
        gameId: games['baldurs-gate-3'].id,
        position: 2,
      },
    })

    console.log('✅ Auto-seeding completed successfully!')
  } catch (err) {
    console.error('❌ Auto-seeding failed:', err)
  }
}
