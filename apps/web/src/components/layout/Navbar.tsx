'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

const NAV_LINKS = [
  { label: 'Discover', href: '/games' },
  { label: 'Top Rated', href: '/games?sort=top-rated' },
  { label: 'New Releases', href: '/games?sort=new' },
  { label: 'Lists', href: '/lists' },
] as const

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  let actions: React.ReactNode
  if (isLoading) {
    actions = null
  } else if (user) {
    actions = (
      <>
        <Link
          href={`/users/${user.username}`}
          className="navbar__icon-btn"
          aria-label="Your profile"
        >
          <User size={20} aria-hidden="true" />
        </Link>
        <button
          onClick={handleLogout}
          className="navbar__btn-ghost"
          aria-label="Sign out"
        >
          <LogOut size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Sign out
        </button>
      </>
    )
  } else {
    actions = (
      <>
        <Link href="/login" className="navbar__btn-ghost">
          Sign in
        </Link>
        <Link href="/register" className="navbar__btn-primary">
          Get started
        </Link>
      </>
    )
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link href="/" className="navbar__logo" aria-label="Continue - home">
          <span className="navbar__logo-text">Continue</span>
        </Link>

        {/* Primary nav */}
        <nav className="navbar__nav" aria-label="Primary navigation">
          <ul className="navbar__nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="navbar__nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <Link href="/search" className="navbar__icon-btn" aria-label="Search games">
            <Search size={20} aria-hidden="true" />
          </Link>

          {actions}
        </div>
      </div>
    </header>
  )
}
