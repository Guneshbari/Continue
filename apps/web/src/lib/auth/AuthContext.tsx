'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authApi, type AuthTokens } from '@/lib/api/auth'

interface AuthUser {
  id: string
  username: string
  email: string
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  token: string | null
  login: (tokens: Omit<AuthTokens, 'refreshToken'>) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sync state helpers
  const handleRefreshed = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail as { accessToken: string; user: AuthUser }
    setAccessToken(detail.accessToken)
    setUser(detail.user)
    localStorage.setItem('auth_user', JSON.stringify(detail.user))
  }, [])

  const handleExpired = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    localStorage.removeItem('auth_user')
  }, [])

  // Silent refresh bootstrap hydration on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:session_refreshed', handleRefreshed)
      window.addEventListener('auth:session_expired', handleExpired)
    }

    const bootstrap = async () => {
      try {
        const result = await authApi.refresh('')
        if (typeof window !== 'undefined') {
          ;(window as any).__access_token = result.accessToken
        }
        setAccessToken(result.accessToken)
        setUser(result.user)
        localStorage.setItem('auth_user', JSON.stringify(result.user))
      } catch {
        if (typeof window !== 'undefined') {
          ;(window as any).__access_token = null
        }
        localStorage.removeItem('auth_user')
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:session_refreshed', handleRefreshed)
        window.removeEventListener('auth:session_expired', handleExpired)
      }
    }
  }, [handleRefreshed, handleExpired])

  const login = useCallback((tokens: Omit<AuthTokens, 'refreshToken'>) => {
    if (typeof window !== 'undefined') {
      ;(window as any).__access_token = tokens.accessToken
    }
    localStorage.setItem('auth_user', JSON.stringify(tokens.user))
    setAccessToken(tokens.accessToken)
    setUser(tokens.user)
  }, [])

  const logout = useCallback(async () => {
    const activeToken =
      accessToken || (typeof window !== 'undefined' ? (window as any).__access_token : null)
    if (activeToken) {
      try {
        await authApi.logout(activeToken)
      } catch {
        /* ignore failures on logout */
      }
    }
    if (typeof window !== 'undefined') {
      ;(window as any).__access_token = null
    }
    localStorage.removeItem('auth_user')
    setAccessToken(null)
    setUser(null)
  }, [accessToken])

  return (
    <AuthContext.Provider
      value={{ user, accessToken, token: accessToken, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
