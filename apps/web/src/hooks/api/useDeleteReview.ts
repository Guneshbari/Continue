import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '@/lib/api/reviews-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useDeleteReview(gameId: string, token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!token) throw new Error('Not authenticated')
      return reviewsApi.remove(gameId, reviewId, token)
    },
    onMutate: async (reviewId) => {
      const listKey = queryKeys.reviews.list(gameId)
      await queryClient.cancelQueries({ queryKey: listKey })

      const previousReviews = queryClient.getQueryData(listKey) as any

      if (previousReviews && Array.isArray(previousReviews.data)) {
        queryClient.setQueryData(listKey, {
          ...previousReviews,
          data: previousReviews.data.filter((r: any) => r.id !== reviewId),
        })
      }

      return { previousReviews }
    },
    onError: (err, reviewId, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(queryKeys.reviews.list(gameId), context.previousReviews)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list(gameId) })
    },
  })
}
