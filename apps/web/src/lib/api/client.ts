import { env } from '@/lib/env'
import type { ApiError } from '@continue/types'

class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(
      typeof body.message === 'string'
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(', ')
          : 'Request failed',
    )
    this.name = 'ApiClientError'
  }
}

class ApiTimeoutError extends Error {
  constructor(message = 'Request timed out. Please try again.') {
    super(message)
    this.name = 'ApiTimeoutError'
  }
}

let activeRefreshPromise: Promise<string> | null = null
let retryCounter = 0

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string | undefined; timeoutMs?: number },
): Promise<T> {
  const { token, timeoutMs = 10000, ...fetchOptions } = options ?? {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string> | undefined),
  }

  // Ephemeral in-memory fallback
  if (!token && typeof window !== 'undefined') {
    const memoryToken = (window as any).__access_token
    if (memoryToken) {
      headers['Authorization'] = `Bearer ${memoryToken}`
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let res = await fetch(`${env.apiUrl}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers,
    })

    // 401 Unauthorized — auto refresh interceptor
    if (
      res.status === 401 &&
      path !== '/auth/refresh' &&
      path !== '/auth/login' &&
      path !== '/auth/register' &&
      typeof window !== 'undefined'
    ) {
      if (retryCounter < 1) {
        retryCounter++

        try {
          if (!activeRefreshPromise) {
            activeRefreshPromise = (async () => {
              const refreshRes = await fetch(`${env.apiUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              })

              if (!refreshRes.ok) {
                activeRefreshPromise = null
                throw new Error('Session expired')
              }

              const data = (await refreshRes.json()) as { accessToken: string; user: any }
              ;(window as any).__access_token = data.accessToken

              // Broadcast update to sync AuthContext state
              window.dispatchEvent(new CustomEvent('auth:session_refreshed', { detail: data }))

              return data.accessToken
            })()
          }

          const newAccessToken = await activeRefreshPromise
          activeRefreshPromise = null
          retryCounter = 0

          headers['Authorization'] = `Bearer ${newAccessToken}`
          res = await fetch(`${env.apiUrl}${path}`, {
            ...fetchOptions,
            signal: controller.signal,
            headers,
          })
        } catch {
          activeRefreshPromise = null
          retryCounter = 0
          ;(window as any).__access_token = null
          window.dispatchEvent(new CustomEvent('auth:session_expired'))
        }
      }
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({
        statusCode: res.status,
        error: 'Unknown',
        message: 'Request failed',
      }))) as ApiError
      throw new ApiClientError(res.status, body)
    }

    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiTimeoutError()
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export const apiClient = {
  get<T>(path: string, token?: string) {
    return apiFetch<T>(path, { method: 'GET', ...(token ? { token } : {}) })
  },

  post<T>(path: string, body: unknown, token?: string) {
    return apiFetch<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...(token ? { token } : {}),
    })
  },

  patch<T>(path: string, body: unknown, token?: string) {
    return apiFetch<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...(token ? { token } : {}),
    })
  },

  put<T>(path: string, body: unknown, token?: string) {
    return apiFetch<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...(token ? { token } : {}),
    })
  },

  delete<T>(path: string, token?: string) {
    return apiFetch<T>(path, { method: 'DELETE', ...(token ? { token } : {}) })
  },
}

export { ApiClientError, ApiTimeoutError }
