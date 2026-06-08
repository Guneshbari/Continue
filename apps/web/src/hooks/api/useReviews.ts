import { useQuery } from '@tanstack/react-query'
import { reviewsApi } from '@/lib/api/reviews-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useReviews(gameId: string, limit = 30, cursor?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.list(gameId),
    queryFn: () => reviewsApi.list(gameId, limit, cursor),
    enabled: !!gameId,
  })
}
