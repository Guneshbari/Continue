import { Module } from '@nestjs/common'
import { GamesService } from './games.service'
import { GamesController } from './games.controller'
import { DiscoverController } from './discover.controller'
import { ShelvesController } from './shelves.controller'
import { GameMapper } from './game.mapper'

@Module({
  providers: [GamesService, GameMapper],
  controllers: [GamesController, DiscoverController, ShelvesController],
  exports: [GamesService],
})
export class GamesModule {}
