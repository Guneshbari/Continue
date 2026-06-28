import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryApi } from '@/lib/api/library-api'
import type { LibraryStatus } from '@/lib/api/library-api'
import { listsApi } from '@/lib/api/lists'
import { queryKeys } from '@/lib/query/query-keys'

export function useLibraryStatus(
  gameId: string,
  username: string | undefined,
  token: string | undefined,
) {
  const queryClient = useQueryClient()
  const queryKey = ['users', username, 'lists', { gameId }]

  const { data: lists = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      if (!username) return []
      return listsApi.byUser(username, token, gameId)
    },
    enabled: !!username && !!gameId,
  })

  const statusSlugs = ['playing', 'completed', 'dropped', 'backlog', 'wishlist']
  const activeList = lists.find(
    (l) => statusSlugs.includes(l.slug) && l.items && l.items.length > 0,
  )
  const currentStatus: LibraryStatus = activeList ? (activeList.slug as LibraryStatus) : 'none'

  const mutation = useMutation({
    mutationFn: async (newStatus: LibraryStatus) => {
      if (!username || !token) throw new Error('Not authenticated')
      return libraryApi.setStatus(username, token, gameId, newStatus)
    },
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey })
      const prevLists = queryClient.getQueryData(queryKey) as any[] | undefined

      if (prevLists) {
        const nextLists = prevLists.map((list) => {
          const isStatusList = statusSlugs.includes(list.slug)
          if (isStatusList) {
            if (list.slug === newStatus) {
              return { ...list, items: [{ gameId }] }
            } else {
              return { ...list, items: [] }
            }
          }
          return list
        })
        queryClient.setQueryData(queryKey, nextLists)
      }

      return { prevLists }
    },
    onError: (err, newStatus, context) => {
      if (context?.prevLists) {
        queryClient.setQueryData(queryKey, context.prevLists)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      if (username) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists(username) })
      }
    },
  })

  return {
    status: currentStatus,
    isLoading,
    setStatus: mutation.mutateAsync,
    isSettingStatus: mutation.isPending,
    error: mutation.error,
  }
}
