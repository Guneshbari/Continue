import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/lib/api/search-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useSearch(q: string, limit = 20) {
  const normalizedQ = q.trim()
  return useQuery({
    queryKey: queryKeys.search.query(normalizedQ, limit),
    queryFn: () => searchApi.search(normalizedQ, limit),
    enabled: normalizedQ.length >= 2,
  })
}
