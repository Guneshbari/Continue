import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0d0d14',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://continue.app'),
  title: {
    default: 'Continue — Discover Your Next Game',
    template: '%s | Continue',
  },
  description:
    'Discover, rate, and collect games. Cinematic game discovery platform for players who care about quality.',
  keywords: ['games', 'game discovery', 'game reviews', 'game ratings', 'gaming platform'],
  authors: [{ name: 'Continue' }],
  creator: 'Continue',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://continue.app',
    siteName: 'Continue',
    title: 'Continue — Discover Your Next Game',
    description: 'Discover, rate, and collect games.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Continue — Discover Your Next Game',
    description: 'Discover, rate, and collect games.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}
