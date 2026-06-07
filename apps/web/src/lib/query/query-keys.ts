export const queryKeys = {
  games: {
    all: ['games'] as const,
    lists: () => [...queryKeys.games.all, 'list'] as const,
    list: (params: Record<string, any>) => [...queryKeys.games.lists(), params] as const,
    details: () => [...queryKeys.games.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.games.details(), slug] as const,
  },
  shelves: {
    all: ['shelves'] as const,
    lists: () => [...queryKeys.shelves.all, 'list'] as const,
    detail: (kind: string, limit?: number) => [...queryKeys.shelves.lists(), { kind, limit }] as const,
  },
  search: {
    all: ['search'] as const,
    query: (q: string, limit?: number) => [...queryKeys.search.all, 'query', { q, limit }] as const,
    suggestions: (q: string, limit?: number) => [...queryKeys.search.all, 'suggestions', { q, limit }] as const,
  },
  discover: {
    all: ['discover'] as const,
    metadata: () => [...queryKeys.discover.all, 'metadata'] as const,
  },
}
