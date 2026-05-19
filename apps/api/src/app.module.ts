import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './common/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { GamesModule } from './modules/games/games.module'
import { RatingsModule } from './modules/ratings/ratings.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long', ttl: 60000, limit: 300 },
    ]),
    PrismaModule,
    AuthModule,
    GamesModule,
    RatingsModule,
    ReviewsModule,
    UsersModule,
  ],
})
export class AppModule {}
