'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, User, LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { MobileNav } from '@/components/layout/MobileNav'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'

const NAV_LINKS = [
  { label: 'Discover', href: '/games' },
  { label: 'Top Rated', href: '/games?sort=top-rated' },
  { label: 'New Releases', href: '/games?sort=new' },
  { label: 'Lists', href: '/lists' },
] as const

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isLinkActive = (href: string) => {
    const base = href.split('?')[0] ?? ''
    // Exact match for query-param routes, prefix match for clean paths
    if (href.includes('?')) return pathname + '' === base && false // these are filter states, never "active page"
    return pathname === href || (base !== '/' && pathname.startsWith(base))
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
    <>
      <header className="navbar">
        <div className="navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo" aria-label="Continue - home">
            <span className="navbar__logo-text">Continue</span>
          </Link>

          {/* Primary nav — desktop */}
          <nav className="navbar__nav" aria-label="Primary navigation">
            <ul className="navbar__nav-list">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link.href)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn('navbar__nav-link', active && 'navbar__nav-link--active')}
                      aria-current={active ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="navbar__actions">
            <Link href="/search" className="navbar__icon-btn" aria-label="Search games">
              <Search size={20} aria-hidden="true" />
            </Link>

            {actions}

            {/* Hamburger — tablet only (640px–1024px) */}
            <button
              className="navbar__hamburger"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer — tablet */}
      <MobileNav isOpen={mobileOpen} onClose={closeMobile} />
    </>
  )
}
