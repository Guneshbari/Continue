import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/lib/api/search-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useSearchSuggestions(q: string, limit = 5) {
  const normalizedQ = q.trim()
  return useQuery({
    queryKey: queryKeys.search.suggestions(normalizedQ, limit),
    queryFn: () => searchApi.suggestions(normalizedQ, limit),
    enabled: normalizedQ.length >= 2,
  })
}
