import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listsApi } from '@/lib/api/lists'
import type { CreateListPayload } from '@/lib/api/lists'
import { queryKeys } from '@/lib/query/query-keys'

export function useUpdateList(username: string | undefined, token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listId, payload }: { listId: string; payload: Partial<CreateListPayload> }) => {
      if (!token) throw new Error('Not authenticated')
      return listsApi.update(listId, token, payload)
    },
    onSuccess: (data) => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
      }
      queryClient.invalidateQueries({ queryKey: ['lists', data.slug] })
      queryClient.invalidateQueries({ queryKey: ['users', username, 'lists', data.slug] })
    },
  })
}
