import { Module } from '@nestjs/common'
import { FixtureLoaderService } from './fixture-loader.service'
import { ScenarioRegistryService } from './scenario-registry.service'
import { PrismaModule } from '../../common/prisma/prisma.module'

/**
 * FixturesModule
 *
 * Encapsulates canonical fixture loading infrastructure.
 * Exports FixtureLoaderService so it can be invoked from:
 *   - A dedicated seed script (apps/api/prisma/seed.ts)
 *   - An admin-only HTTP endpoint (future)
 *   - An NestJS OnApplicationBootstrap hook (dev-only)
 *
 * NOT imported in AppModule by default — invoked explicitly via seed script.
 */
@Module({
  imports: [PrismaModule],
  providers: [ScenarioRegistryService, FixtureLoaderService],
  exports: [FixtureLoaderService, ScenarioRegistryService],
})
export class FixturesModule {}
