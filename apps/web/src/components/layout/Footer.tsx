import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'

const DISCOVER_LINKS = [
  { label: 'All Games', href: '/games' },
  { label: 'Top Rated', href: '/games?sort=top-rated' },
  { label: 'New Releases', href: '/games?sort=new' },
  { label: 'Trending', href: '/games?sort=trending' },
] as const

const COMMUNITY_LINKS = [
  { label: 'Collections', href: '/lists' },
  { label: 'Reviews', href: '/games' },
] as const

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
] as const

export function Footer() {
  return (
    <>
      {/* Bottom nav for phones — rendered inside footer for correct stacking */}
      <BottomNav />

      <footer className="footer">
        <div className="footer__inner">
          {/* Brand column */}
          <div className="footer__brand-col">
            <Link href="/" className="footer__logo" aria-label="Continue - home">
              Continue
            </Link>
            <p className="footer__tagline">Discover. Review. Collect.</p>
            <p className="footer__description">
              A cinematic game discovery platform for players who care about quality.
            </p>
          </div>

          {/* Discover column */}
          <div className="footer__nav-col">
            <h3 className="footer__nav-heading">Discover</h3>
            <ul className="footer__nav-list">
              {DISCOVER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community column */}
          <div className="footer__nav-col">
            <h3 className="footer__nav-heading">Community</h3>
            <ul className="footer__nav-list">
              {COMMUNITY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div className="footer__nav-col">
            <h3 className="footer__nav-heading">Company</h3>
            <ul className="footer__nav-list">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-inner">
            <p className="footer__copy">
              &copy; {new Date().getFullYear()} Continue. All rights reserved.
            </p>
            <p className="footer__made-with">Built for players, by players.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
