import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { IgdbAuthService } from './igdb/igdb-auth.service'
import { IgdbApiService } from './igdb/igdb-api.service'
import { FixturesModule } from '../fixtures/fixtures.module'

@Module({
  imports: [ConfigModule, FixturesModule],
  providers: [IgdbAuthService, IgdbApiService],
  exports: [IgdbAuthService, IgdbApiService],
})
export class ProvidersModule {}
