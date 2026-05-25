import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/auth/AuthContext'
import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-ui', display: 'swap' })
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
  title: { default: 'Continue - Discover Your Next Game', template: '%s | Continue' },
  description: 'Discover, rate, and collect games. A cinematic game discovery platform.',
  keywords: ['games', 'game discovery', 'game reviews', 'game ratings'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Continue',
    title: 'Continue - Discover Your Next Game',
    description: 'Discover, rate, and collect games.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <AuthProvider>
          <div className="cinematic-ambient-spotlight" />
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

