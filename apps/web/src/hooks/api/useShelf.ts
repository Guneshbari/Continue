import { useQuery } from '@tanstack/react-query'
import { shelvesApi } from '@/lib/api/shelves-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useShelf(kind: string, limit = 12) {
  return useQuery({
    queryKey: queryKeys.shelves.detail(kind, limit),
    queryFn: () => shelvesApi.getShelf(kind, limit),
    enabled: !!kind,
  })
}
