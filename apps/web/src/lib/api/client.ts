import { env } from '@/lib/env'
import type { ApiError } from '@continue/types'

class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(body.message as string)
    this.name = 'ApiClientError'
  }
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string | undefined },
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {}

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string> | undefined),
  }

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({
      statusCode: res.status,
      error: 'Unknown',
      message: 'Request failed',
    }))) as ApiError
    throw new ApiClientError(res.status, body)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
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

  delete<T>(path: string, token?: string) {
    return apiFetch<T>(path, { method: 'DELETE', ...(token ? { token } : {}) })
  },
}

export { ApiClientError }
