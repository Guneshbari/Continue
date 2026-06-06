import { Module, forwardRef } from '@nestjs/common'
import { GamesModule } from '../games/games.module'
import { SEARCH_PROVIDER } from './providers/search-provider.interface'
import { PrismaSearchProvider } from './providers/prisma-search.provider'
import { FacetAggregationService } from './services/facet-aggregation.service'
import { DiscoveryService } from './services/discovery.service'
import { TrendingStrategy } from './strategies/trending.strategy'
import { TopRatedStrategy } from './strategies/top-rated.strategy'
import { RecentReleasesStrategy } from './strategies/recent-releases.strategy'
import { NewlyAddedStrategy } from './strategies/newly-added.strategy'
import { HiddenGemsStrategy } from './strategies/hidden-gems.strategy'

@Module({
  imports: [forwardRef(() => GamesModule)],
  providers: [
    {
      provide: SEARCH_PROVIDER,
      useClass: PrismaSearchProvider,
    },
    FacetAggregationService,
    TrendingStrategy,
    TopRatedStrategy,
    RecentReleasesStrategy,
    NewlyAddedStrategy,
    HiddenGemsStrategy,
    DiscoveryService,
  ],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
