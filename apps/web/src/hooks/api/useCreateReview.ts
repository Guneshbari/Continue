import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '@/lib/api/reviews-api'
import type { CreateReviewPayload } from '@/lib/api/reviews-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useCreateReview(gameId: string, token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      if (!token) throw new Error('Not authenticated')
      return reviewsApi.create(gameId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list(gameId) })
    },
  })
}
