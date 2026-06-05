import { Module, forwardRef } from '@nestjs/common'
import { GamesService } from './games.service'
import { GamesController } from './games.controller'
import { DiscoverController } from './discover.controller'
import { ShelvesController } from './shelves.controller'
import { GameMapper } from './game.mapper'
import { DiscoveryModule } from '../discovery/discovery.module'

@Module({
  imports: [forwardRef(() => DiscoveryModule)],
  providers: [GamesService, GameMapper],
  controllers: [GamesController, DiscoverController, ShelvesController],
  exports: [GamesService, GameMapper],
})
export class GamesModule {}
