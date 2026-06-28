import { Test, type TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { IgdbAuthService } from './igdb-auth.service'
import { IgdbApiService } from './igdb-api.service'
import { ScenarioRegistryService } from '../../fixtures/scenario-registry.service'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('IGDB Resiliency Spec', () => {
  let authService: IgdbAuthService
  let apiService: IgdbApiService
  let mockConfig: Record<string, string>

  beforeEach(async () => {
    jest.clearAllMocks()

    mockConfig = {
      TWITCH_CLIENT_ID: 'fake-client-id',
      TWITCH_CLIENT_SECRET: 'fake-client-secret',
      IGDB_OFFLINE_MODE: 'false',
    }

    const mockConfigService = {
      get: jest.fn((key: string) => mockConfig[key]),
    }

    const mockFixtureRegistry = {
      resolveDataset: jest.fn().mockReturnValue([]),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IgdbAuthService,
        IgdbApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ScenarioRegistryService, useValue: mockFixtureRegistry },
      ],
    }).compile()

    authService = module.get<IgdbAuthService>(IgdbAuthService)
    apiService = module.get<IgdbApiService>(IgdbApiService)
  })

  describe('Twitch Access Token Serialization', () => {
    it('should serialize parallel getAccessToken calls to prevent duplicate Twitch requests', async () => {
      // Mock Twitch OAuth to return successfully with a delay
      mockedAxios.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve({
                data: {
                  access_token: 'new-serialized-token',
                  expires_in: 3600,
                },
              } as any)
            }, 50),
          ),
      )

      // Trigger parallel token requests
      const [token1, token2] = await Promise.all([
        authService.getAccessToken(),
        authService.getAccessToken(),
      ])

      // Confirm only one Axios POST request was made
      expect(mockedAxios.post).toHaveBeenCalledTimes(1)
      expect(token1).toBe('new-serialized-token')
      expect(token2).toBe('new-serialized-token')
    })
  })

  describe('Circuit Breaker Foundation', () => {
    it('should trip after 5 consecutive failures and suspend further calls', async () => {
      // Mock Twitch token cache to be warm
      jest.spyOn(authService, 'getAccessToken').mockResolvedValue('mock-token')

      // Mock IGDB API post to consistently fail
      mockedAxios.post.mockRejectedValue(new Error('IGDB Server Error'))

      // Trigger 5 consecutive failures
      for (let i = 0; i < 5; i++) {
        await expect(apiService.searchGames('Halo')).rejects.toThrow('IGDB API Request Failed')
      }

      // Verify that Axios POST was called 5 times
      expect(mockedAxios.post).toHaveBeenCalledTimes(5)

      // The 6th request should trip the breaker and fail immediately without hitting Axios
      await expect(apiService.searchGames('Halo')).rejects.toThrow(
        'IGDB API provider suspended due to too many consecutive failures',
      )

      // Expect Axios post calls count to still be exactly 5
      expect(mockedAxios.post).toHaveBeenCalledTimes(5)
    })
  })

  describe('HTTP 401 Unauthorized Auto-Retry', () => {
    it('should automatically clear token cache, refresh access token, and retry request on 401', async () => {
      // Mock getAccessToken to return a stale token
      jest.spyOn(authService, 'getAccessToken').mockResolvedValue('stale-token')

      const refreshSpy = jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(undefined)

      // First call returns 401, second call returns successful games list
      mockedAxios.post
        .mockRejectedValueOnce({
          response: { status: 401, data: 'Unauthorized' },
        })
        .mockResolvedValueOnce({
          headers: {},
          data: [
            {
              id: 117,
              name: 'Master Chief Collection',
              slug: 'halo-mcc',
            },
          ],
        })

      const games = await apiService.searchGames('Halo')

      // Verify that Axios was called twice (first fail, second success)
      expect(mockedAxios.post).toHaveBeenCalledTimes(2)
      expect(refreshSpy).toHaveBeenCalledTimes(1)
      expect(games).toHaveLength(1)
      expect(games[0]?.title).toBe('Master Chief Collection')
    })
  })
})
