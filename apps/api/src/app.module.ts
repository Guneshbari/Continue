import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './common/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from './modules/auth/guards/roles.guard'
import { GamesModule } from './modules/games/games.module'
import { RatingsModule } from './modules/ratings/ratings.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { UsersModule } from './modules/users/users.module'
import { SearchModule } from './modules/search/search.module'
import { ListsModule } from './modules/lists/lists.module'
import { HealthModule } from './modules/health/health.module'
import { FixturesModule } from './modules/fixtures/fixtures.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { validateEnv } from './common/config/env.validation'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
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
    SearchModule,
    ListsModule,
    HealthModule,
    FixturesModule,
    ProvidersModule,
  ],
  providers: [
    // LoggingInterceptor runs first — wraps the full pipeline
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
