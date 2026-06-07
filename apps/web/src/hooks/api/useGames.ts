import { useQuery } from '@tanstack/react-query'
import { gamesApi } from '@/lib/api/games-api'
import type { GamesListParams } from '@/lib/api/games-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useGames(params: GamesListParams = {}) {
  return useQuery({
    queryKey: queryKeys.games.list(params),
    queryFn: () => gamesApi.list(params),
  })
}
