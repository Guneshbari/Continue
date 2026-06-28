'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Trophy, Sparkles, List } from 'lucide-react'
import { cn } from '@/lib/utils'

const BOTTOM_NAV_LINKS = [
  { label: 'Discover', href: '/games', icon: Compass },
  { label: 'Top Rated', href: '/games?sort=top-rated', icon: Trophy },
  { label: 'New', href: '/games?sort=new', icon: Sparkles },
  { label: 'Lists', href: '/lists', icon: List },
] as const

/**
 * Bottom navigation bar for phone viewports (< 640px).
 * App-like tab bar with icons + labels.
 * Fixed to the bottom of the viewport.
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <ul className="bottom-nav__list" role="list">
        {BOTTOM_NAV_LINKS.map(({ label, href, icon: Icon }) => {
          const basePath = href.split('?')[0] ?? ''
          const isActive =
            pathname === href ||
            (basePath !== '/' && pathname.startsWith(basePath) && !href.includes('?'))
          return (
            <li key={href} className="bottom-nav__item">
              <Link
                href={href}
                className={cn('bottom-nav__link', isActive && 'bottom-nav__link--active')}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
              >
                <Icon
                  size={22}
                  className="bottom-nav__icon"
                  aria-hidden="true"
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                <span className="bottom-nav__label">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
