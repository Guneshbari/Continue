import { ratingsApi, type RatingResponse } from './ratings-api'
import { reviewsApi, type ReviewResponse } from './reviews-api'
import { libraryApi } from './library-api'
import { listsApi, type ListSummary, type ListDetail, type ListItem } from './lists-api'

export function verifyMutationContracts() {
  const token = 'mock-token'
  const gameId = 'game-id'
  const username = 'testuser'
  const reviewId = 'review-id'
  const listId = 'list-id'

  // 1. Ratings API
  const ratingUpsertPromise: Promise<RatingResponse> = ratingsApi.upsert(gameId, 9, token)
  const ratingRemovePromise: Promise<void> = ratingsApi.remove(gameId, token)
  const ratingMePromise: Promise<RatingResponse | null> = ratingsApi.myRating(gameId, token)

  // 2. Reviews API
  const reviewListPromise: Promise<{ data: ReviewResponse[] }> = reviewsApi.list(gameId, 10, 'cursor')
  const reviewCreatePromise: Promise<ReviewResponse> = reviewsApi.create(gameId, { body: 'Great game!', score: 9 } as any, token)
  const reviewUpdatePromise: Promise<ReviewResponse> = reviewsApi.update(gameId, reviewId, { body: 'Updated body' }, token)
  const reviewRemovePromise: Promise<void> = reviewsApi.remove(gameId, reviewId, token)

  // 3. Library API
  const librarySetStatusPromise: Promise<void> = libraryApi.setStatus(username, token, gameId, 'playing')

  // 4. Lists API
  const listCreatePromise: Promise<ListSummary> = listsApi.create(token, { title: 'My List' })
  const listByUserPromise: Promise<ListSummary[]> = listsApi.byUser(username, token, gameId)
  const listGetOnePromise: Promise<ListDetail> = listsApi.getOne(username, 'my-list', token)
  const listGetBySlugPromise: Promise<ListDetail> = listsApi.getBySlug('my-list', token)
  const listUpdatePromise: Promise<ListSummary> = listsApi.update(listId, token, { title: 'Updated List' })
  const listReorderPromise: Promise<ListDetail> = listsApi.reorderItems(listId, ['game-1', 'game-2'], token)
  const listDeletePromise: Promise<void> = listsApi.delete(listId, token)
  const listAddItemPromise: Promise<ListItem> = listsApi.addItem(listId, token, gameId, 'My note')
  const listRemoveItemPromise: Promise<void> = listsApi.removeItem(listId, gameId, token)

  return {
    ratingUpsertPromise,
    ratingRemovePromise,
    ratingMePromise,
    reviewListPromise,
    reviewCreatePromise,
    reviewUpdatePromise,
    reviewRemovePromise,
    librarySetStatusPromise,
    listCreatePromise,
    listByUserPromise,
    listGetOnePromise,
    listGetBySlugPromise,
    listUpdatePromise,
    listReorderPromise,
    listDeletePromise,
    listAddItemPromise,
    listRemoveItemPromise,
  }
}
