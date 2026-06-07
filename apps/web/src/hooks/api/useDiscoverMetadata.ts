import { useQuery } from '@tanstack/react-query'
import { discoveryApi } from '@/lib/api/discovery-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useDiscoverMetadata() {
  return useQuery({
    queryKey: queryKeys.discover.metadata(),
    queryFn: () => discoveryApi.metadata(),
    staleTime: 60 * 60 * 1000, // 1 hour caching for metadata
  })
}
