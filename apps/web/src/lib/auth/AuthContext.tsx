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
  login: (tokens: AuthTokens) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('access_token')
      const raw = localStorage.getItem('auth_user')
      if (token && raw) {
        setAccessToken(token)
        setUser(JSON.parse(raw))
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback((tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.accessToken)
    localStorage.setItem('refresh_token', tokens.refreshToken)
    localStorage.setItem('auth_user', JSON.stringify(tokens.user))
    setAccessToken(tokens.accessToken)
    setUser(tokens.user)
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try { await authApi.logout(token) } catch { /* ignore */ }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    setAccessToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, accessToken, token: accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
