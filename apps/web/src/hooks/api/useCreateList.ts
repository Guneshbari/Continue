import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listsApi } from '@/lib/api/lists'
import type { CreateListPayload } from '@/lib/api/lists'
import { queryKeys } from '@/lib/query/query-keys'

export function useCreateList(username: string | undefined, token: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateListPayload) => {
      if (!token) throw new Error('Not authenticated')
      return listsApi.create(token, payload)
    },
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
      }
      queryClient.invalidateQueries({ queryKey: ['shelves'] })
    },
  })
}
