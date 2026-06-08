import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ratingsApi } from '@/lib/api/ratings-api'
import { queryKeys } from '@/lib/query/query-keys'
import { useQueryInvalidation } from '@/lib/query/invalidation'

export function useRateGame(gameId: string, slug: string, token: string | undefined) {
  const queryClient = useQueryClient()
  const { invalidateGame } = useQueryInvalidation()

  const rateMutation = useMutation({
    mutationFn: async (score: number) => {
      if (!token) throw new Error('Not authenticated')
      return ratingsApi.upsert(gameId, score, token)
    },
    onMutate: async (newScore) => {
      const meKey = queryKeys.ratings.me(gameId)
      const detailKey = queryKeys.games.detail(slug)

      await queryClient.cancelQueries({ queryKey: meKey })
      await queryClient.cancelQueries({ queryKey: detailKey })

      const prevRating = queryClient.getQueryData(meKey) as any
      const prevDetail = queryClient.getQueryData(detailKey) as any

      queryClient.setQueryData(meKey, {
        id: prevRating?.id || 'temp-id',
        userId: prevRating?.userId || 'temp-user-id',
        gameId,
        score: newScore,
        updatedAt: new Date().toISOString(),
      })

      if (prevDetail) {
        const hasPrevRating = !!prevRating && prevRating.score > 0
        const prevScore = hasPrevRating ? prevRating.score : 0

        let newCount = prevDetail.ratingCount
        let newAvg = prevDetail.avgRating ?? 0

        if (!hasPrevRating) {
          newCount += 1
          newAvg = ((prevDetail.avgRating ?? 0) * prevDetail.ratingCount + newScore) / newCount
        } else {
          newAvg = ((prevDetail.avgRating ?? 0) * prevDetail.ratingCount - prevScore + newScore) / newCount
        }

        queryClient.setQueryData(detailKey, {
          ...prevDetail,
          avgRating: newAvg,
          ratingCount: newCount,
        })
      }

      return { prevRating, prevDetail }
    },
    onError: (err, newScore, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.ratings.me(gameId), context.prevRating)
        queryClient.setQueryData(queryKeys.games.detail(slug), context.prevDetail)
      }
    },
    onSettled: () => {
      invalidateGame(slug, gameId)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Not authenticated')
      return ratingsApi.remove(gameId, token)
    },
    onMutate: async () => {
      const meKey = queryKeys.ratings.me(gameId)
      const detailKey = queryKeys.games.detail(slug)

      await queryClient.cancelQueries({ queryKey: meKey })
      await queryClient.cancelQueries({ queryKey: detailKey })

      const prevRating = queryClient.getQueryData(meKey) as any
      const prevDetail = queryClient.getQueryData(detailKey) as any

      queryClient.setQueryData(meKey, null)

      if (prevDetail && prevRating && prevRating.score > 0) {
        const prevScore = prevRating.score
        const newCount = Math.max(0, prevDetail.ratingCount - 1)
        const newAvg = newCount > 0 ? (prevDetail.avgRating * prevDetail.ratingCount - prevScore) / newCount : null

        queryClient.setQueryData(detailKey, {
          ...prevDetail,
          avgRating: newAvg,
          ratingCount: newCount,
        })
      }

      return { prevRating, prevDetail }
    },
    onError: (err, _, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.ratings.me(gameId), context.prevRating)
        queryClient.setQueryData(queryKeys.games.detail(slug), context.prevDetail)
      }
    },
    onSettled: () => {
      invalidateGame(slug, gameId)
    },
  })

  return {
    rateGame: rateMutation.mutateAsync,
    isRating: rateMutation.isPending,
    ratingError: rateMutation.error,

    deleteRating: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  }
}
