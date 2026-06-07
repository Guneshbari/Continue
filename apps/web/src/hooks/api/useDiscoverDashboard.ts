import { useQuery } from '@tanstack/react-query'
import { discoveryApi } from '@/lib/api/discovery-api'
import { queryKeys } from '@/lib/query/query-keys'

export function useDiscoverDashboard(limit = 6) {
  return useQuery({
    queryKey: [...queryKeys.discover.all, 'dashboard', limit] as const,
    queryFn: () => discoveryApi.discoverDashboard(limit),
  })
}
