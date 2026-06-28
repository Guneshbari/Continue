'use client'

/**
 * providers.tsx
 *
 * Client-boundary wrapper for all app-wide context providers.
 * Mounted once in layout.tsx, wraps the entire page tree.
 *
 * Provider stack (order matters — outermost first):
 *   ThemeProvider  → next-themes, SSR-safe, class-based dark mode
 *   LenisProvider  → smooth scroll, RAF-driven, respects reduced-motion
 *
 * AuthProvider is NOT included here — it has its own session logic
 * and is mounted directly in layout.tsx to keep concerns separated.
 */

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import Lenis from 'lenis'

/* ── Lenis smooth scroll init ─────────────────────────────────────── */

function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect the user's OS-level reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    let rafId: number

    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

import { QueryProvider } from '@/lib/query/query-provider'

/* ── Root providers composition ───────────────────────────────────── */

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <LenisProvider>{children}</LenisProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
