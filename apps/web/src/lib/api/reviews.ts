import { apiClient } from './client'
import type { FeaturedReview } from '@continue/types'

export const reviewsApi = {
  featured(limit = 3): Promise<FeaturedReview[]> {
    return apiClient.get(`/reviews/featured?limit=${limit}`)
  },
}
