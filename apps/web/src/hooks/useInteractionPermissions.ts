import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

export function useInteractionPermissions() {
  const { user, token } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const ensureAuth = (action?: () => void) => {
    if (!user || !token) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
      return false
    }
    if (action) {
      action()
    }
    return true
  }

  return {
    isAuthenticated: !!user,
    userId: user?.id,
    username: user?.username || undefined,
    token: token || undefined,
    
    canRate: () => !!user,
    canReview: () => !!user,
    canManageLists: () => !!user,
    canModifyLibrary: () => !!user,

    guardAction: (action?: () => void) => {
      return ensureAuth(action)
    }
  }
}
