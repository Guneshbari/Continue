import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './common/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { GamesModule } from './modules/games/games.module'
// Phase 3+ modules (uncomment when implemented):
// import { UsersModule } from './modules/users/users.module'
// import { ReviewsModule } from './modules/reviews/reviews.module'
// import { RatingsModule } from './modules/ratings/ratings.module'
// import { SearchModule } from './modules/search/search.module'
// import { ListsModule } from './modules/lists/lists.module'
// import { AdminModule } from './modules/admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long', ttl: 60000, limit: 300 },
    ]),
    PrismaModule,
    AuthModule,
    GamesModule,
  ],
})
export class AppModule {}

