import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'

export function useQueryInvalidation() {
  const queryClient = useQueryClient()

  return {
    invalidateGame: async (slug: string, gameId?: string) => {
      // Invalidate game details
      await queryClient.invalidateQueries({ queryKey: queryKeys.games.detail(slug) })
      
      // If we have gameId, invalidate user rating and reviews for this game
      if (gameId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.ratings.me(gameId) })
        await queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list(gameId) })
      }
    },

    invalidateUser: async (username: string) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(username) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.ratings(username) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.reviews(username) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
    },

    invalidateLists: async (username?: string) => {
      if (username) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
      }
      await queryClient.invalidateQueries({ queryKey: ['shelves'] })
    },
  }
}
