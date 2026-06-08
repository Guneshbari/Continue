import { useQuery } from '@tanstack/react-query'
import { ratingsApi } from '@/lib/api/ratings-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useMyRating(gameId: string, token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.ratings.me(gameId),
    queryFn: () => {
      if (!token) return null
      return ratingsApi.myRating(gameId, token)
    },
    enabled: !!token && !!gameId,
  })
}
