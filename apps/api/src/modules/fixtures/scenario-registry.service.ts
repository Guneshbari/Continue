import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { FixtureGame } from './fixture.types'
import { MINIMAL_GAMES } from './datasets/minimal'
import { REALISTIC_GAMES } from './datasets/realistic'
import { STRESS_TEST_GAMES } from './datasets/stress-test'
import { BROKEN_METADATA_GAMES } from './datasets/broken-metadata'

export type FixtureScenarioName = 'minimal' | 'realistic' | 'stress_test' | 'broken_metadata'

/**
 * ScenarioRegistryService
 *
 * Centralized registry for selecting, listing, and resolving fixture scenarios.
 * Completely decouples dataset loading from environment-specific configuration.
 */
@Injectable()
export class ScenarioRegistryService {
  private readonly logger = new Logger(ScenarioRegistryService.name)
  private readonly scenario: FixtureScenarioName

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('FIXTURE_SCENARIO', 'realistic')
    this.scenario = this.resolveScenarioName(raw)
    this.logger.log(`Active fixture scenario resolved: "${this.scenario}"`)
  }

  /**
   * Get the active scenario name resolved from the environment.
   */
  getScenario(): FixtureScenarioName {
    return this.scenario
  }

  /**
   * Returns a list of all supported scenario names.
   */
  listScenarios(): FixtureScenarioName[] {
    return ['minimal', 'realistic', 'stress_test', 'broken_metadata']
  }

  /**
   * Resolves the actual FixtureGame dataset array for a given scenario name.
   */
  resolveDataset(scenario: string): FixtureGame[] {
    switch (scenario) {
      case 'minimal':
        return MINIMAL_GAMES
      case 'stress_test':
        return STRESS_TEST_GAMES
      case 'broken_metadata':
        return BROKEN_METADATA_GAMES
      case 'realistic':
      default:
        return REALISTIC_GAMES
    }
  }

  private resolveScenarioName(raw: string): FixtureScenarioName {
    const valid = this.listScenarios()
    if (valid.includes(raw as FixtureScenarioName)) {
      return raw as FixtureScenarioName
    }
    this.logger.warn(
      `Unknown FIXTURE_SCENARIO="${raw}". Falling back to "realistic". Supported values: ${valid.join(', ')}`,
    )
    return 'realistic'
  }
}
