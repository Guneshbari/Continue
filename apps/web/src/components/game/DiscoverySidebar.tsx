'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Award, Calendar, Clock, Compass, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIDEBAR_ITEMS = [
  { label: 'Overview', href: '/discover', icon: Compass },
  { label: 'Trending', href: '/discover/trending', icon: TrendingUp },
  { label: 'Top Rated', href: '/discover/top-rated', icon: Award },
  { label: 'Most Reviewed', href: '/discover/most-reviewed', icon: MessageSquare },
  { label: 'New Releases', href: '/discover/new-releases', icon: Calendar },
  { label: 'Upcoming', href: '/discover/upcoming', icon: Clock },
] as const

export function DiscoverySidebar() {
  const pathname = usePathname()

  return (
    <aside className="discovery-sidebar" aria-label="Discovery navigation">
      <nav className="discovery-sidebar__nav">
        <ul className="discovery-sidebar__list">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'discovery-sidebar__link',
                    active && 'discovery-sidebar__link--active',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
