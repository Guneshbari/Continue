import Link from 'next/link'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Discover', href: '/games' },
  { label: 'Top Rated', href: '/games?sort=top-rated' },
  { label: 'New Releases', href: '/games?sort=new' },
  { label: 'Lists', href: '/lists' },
] as const

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link href="/" className="navbar__logo" aria-label="Continue — home">
          <span className="navbar__logo-text">Continue</span>
        </Link>

        {/* Primary nav */}
        <nav className="navbar__nav" aria-label="Primary navigation">
          <ul className="navbar__nav-list" role="list">
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
          <Link href="/login" className="navbar__btn-ghost">
            Sign in
          </Link>
          <Link href="/register" className="navbar__btn-primary">
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
