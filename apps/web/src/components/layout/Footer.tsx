import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
] as const

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__brand">Continue</p>
        <nav aria-label="Footer navigation">
          <ul className="footer__links" role="list">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} Continue. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
