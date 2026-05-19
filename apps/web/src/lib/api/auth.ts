import { apiClient } from './client'
import type { UserPublic } from '@continue/types'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: Pick<UserPublic, 'id' | 'username' | 'email' | 'role'>
}

export const authApi = {
  register(data: { username: string; email: string; password: string }): Promise<AuthTokens> {
    return apiClient.post('/auth/register', data)
  },

  login(data: { email: string; password: string }): Promise<AuthTokens> {
    return apiClient.post('/auth/login', data)
  },

  refresh(token: string): Promise<AuthTokens> {
    return apiClient.post('/auth/refresh', {}, token)
  },

  logout(token: string): Promise<void> {
    return apiClient.post('/auth/logout', {}, token)
  },
}
