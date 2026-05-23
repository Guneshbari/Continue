'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Discover', href: '/games' },
  { label: 'Top Rated', href: '/games?sort=top-rated' },
  { label: 'New Releases', href: '/games?sort=new' },
  { label: 'Lists', href: '/lists' },
] as const

type MobileNavProps = Readonly<{
  isOpen: boolean
  onClose: () => void
}>

/**
 * Slide-down overlay nav drawer for tablet (640px–1024px).
 * Closes on route change and Escape key.
 */
export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-nav__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className="mobile-nav"
        id="mobile-nav"
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav__header">
          <span className="mobile-nav__brand">Continue</span>
          <button
            onClick={onClose}
            className="mobile-nav__close"
            aria-label="Close navigation menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <ul className="mobile-nav__list" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href.split('?')[0] ?? '')
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn('mobile-nav__link', isActive && 'mobile-nav__link--active')}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
