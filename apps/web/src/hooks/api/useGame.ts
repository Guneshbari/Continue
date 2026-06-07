import { useQuery } from '@tanstack/react-query'
import { gamesApi } from '@/lib/api/games-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useGame(slug: string) {
  return useQuery({
    queryKey: queryKeys.games.detail(slug),
    queryFn: () => gamesApi.get(slug),
    enabled: !!slug,
  })
}
