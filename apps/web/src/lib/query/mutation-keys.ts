export const mutationKeys = {
  ratings: {
    upsert: (gameId: string) => ['mutations', 'ratings', 'upsert', gameId] as const,
    remove: (gameId: string) => ['mutations', 'ratings', 'remove', gameId] as const,
  },
  reviews: {
    create: (gameId: string) => ['mutations', 'reviews', 'create', gameId] as const,
    update: (reviewId: string) => ['mutations', 'reviews', 'update', reviewId] as const,
    remove: (reviewId: string) => ['mutations', 'reviews', 'remove', reviewId] as const,
  },
  lists: {
    create: () => ['mutations', 'lists', 'create'] as const,
    update: (listId: string) => ['mutations', 'lists', 'update', listId] as const,
    delete: (listId: string) => ['mutations', 'lists', 'delete', listId] as const,
    addItem: (listId: string) => ['mutations', 'lists', 'addItem', listId] as const,
    removeItem: (listId: string) => ['mutations', 'lists', 'removeItem', listId] as const,
  },
}
