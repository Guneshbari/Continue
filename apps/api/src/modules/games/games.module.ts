import { Module } from '@nestjs/common'
import { GamesService } from './games.service'
import { GamesController } from './games.controller'
import { DiscoverController } from './discover.controller'

@Module({
  providers: [GamesService],
  controllers: [GamesController, DiscoverController],
  exports: [GamesService],
})
export class GamesModule {}
