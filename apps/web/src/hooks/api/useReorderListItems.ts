import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listsApi } from '@/lib/api/lists'

export function useReorderListItems(
  listId: string,
  slug: string,
  username: string | undefined,
  token: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (gameIds: string[]) => {
      if (!token) throw new Error('Not authenticated')
      return listsApi.reorderItems(listId, gameIds, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', slug] })
      if (username) {
        queryClient.invalidateQueries({ queryKey: ['users', username, 'lists', slug] })
      }
    },
  })
}
