import { useMutation, useQueryClient } from '@tanstack/react-query'
import { listsApi } from '@/lib/api/lists'
import { queryKeys } from '@/lib/query/query-keys'

export function useAddGameToList(username: string | undefined, token: string | undefined) {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: async ({ listId, gameId, note }: { listId: string; gameId: string; note?: string }) => {
      if (!token) throw new Error('Not authenticated')
      return listsApi.addItem(listId, token, gameId, note)
    },
    onSuccess: (data, variables) => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: ['users', username, 'lists', { gameId: variables.gameId }] })
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
      }
    },
  })

  const removeMutation = useMutation({
    mutationFn: async ({ listId, gameId }: { listId: string; gameId: string }) => {
      if (!token) throw new Error('Not authenticated')
      return listsApi.removeItem(listId, gameId, token)
    },
    onSuccess: (data, variables) => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: ['users', username, 'lists', { gameId: variables.gameId }] })
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
      }
    },
  })

  return {
    addGame: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addError: addMutation.error,

    removeGame: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    removeError: removeMutation.error,
  }
}
