import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'

// Feature modules — imported as stubs, implemented in Phase 2+
// import { AuthModule } from './modules/auth/auth.module'
// import { UsersModule } from './modules/users/users.module'
// import { GamesModule } from './modules/games/games.module'
// import { ReviewsModule } from './modules/reviews/reviews.module'
// import { RatingsModule } from './modules/ratings/ratings.module'
// import { SearchModule } from './modules/search/search.module'
// import { ListsModule } from './modules/lists/lists.module'
// import { AdminModule } from './modules/admin/admin.module'

// Infrastructure modules
import { PrismaModule } from './common/prisma/prisma.module'

@Module({
  imports: [
    // Config — global, loads .env
    ConfigModule.forRoot({ isGlobal: true, cache: true }),

    // Rate limiting — endpoint-specific overrides in each controller
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long', ttl: 60000, limit: 300 },
    ]),

    // Prisma — global DB access
    PrismaModule,

    // Feature modules (uncomment when implementing)
    // AuthModule,
    // UsersModule,
    // GamesModule,
    // ReviewsModule,
    // RatingsModule,
    // SearchModule,
    // ListsModule,
    // AdminModule,
  ],
})
export class AppModule {}
