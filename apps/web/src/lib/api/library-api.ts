import { listsApi } from './lists'

export type LibraryStatus = 'playing' | 'completed' | 'dropped' | 'backlog' | 'wishlist' | 'none'

export const libraryApi = {
  async setStatus(
    username: string,
    token: string,
    gameId: string,
    newStatus: LibraryStatus,
  ): Promise<void> {
    const userLists = await listsApi.byUser(username, token, gameId)
    const statusSlugs = ['playing', 'completed', 'dropped', 'backlog', 'wishlist']

    // 1. Remove game from other status lists it resides in
    const removePromises: Promise<void>[] = []
    for (const list of userLists) {
      if (statusSlugs.includes(list.slug) && list.slug !== newStatus) {
        const hasGame = list.items && list.items.length > 0
        if (hasGame) {
          removePromises.push(listsApi.removeItem(list.id, gameId, token))
        }
      }
    }
    await Promise.all(removePromises)

    if (newStatus === 'none') {
      return
    }

    // 2. Add to new status list
    let targetList = userLists.find((l) => l.slug === newStatus)
    if (!targetList) {
      const titleMap: Record<string, string> = {
        playing: 'Currently Playing',
        completed: 'Completed Games',
        dropped: 'Dropped Games',
        backlog: 'My Backlog',
        wishlist: 'Wishlist',
      }
      targetList = await listsApi.create(token, {
        title: titleMap[newStatus] || newStatus.toUpperCase(),
        visibility: 'PRIVATE',
      })
    }

    const alreadyHas = targetList.items && targetList.items.length > 0
    if (!alreadyHas) {
      await listsApi.addItem(targetList.id, token, gameId)
    }
  },
}
