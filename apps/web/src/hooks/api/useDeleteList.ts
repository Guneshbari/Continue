import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listsApi } from '@/lib/api/lists'
import { queryKeys } from '@/lib/query/query-keys'

export function useDeleteList(username: string | undefined, token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listId: string) => {
      if (!token) throw new Error('Not authenticated')
      return listsApi.delete(listId, token)
    },
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
      }
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
    },
  })
}
