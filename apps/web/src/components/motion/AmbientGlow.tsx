'use client'

/**
 * GSAP-powered floating gradient orbs for hero/editorial backgrounds.
 *
 * Renders 2–3 absolutely-positioned radial-gradient circles that drift
 * slowly via GSAP `yoyo` tweens, creating an organic ambient glow.
 *
 * - GSAP is **lazy-loaded** via `loadGsap()` — never in the initial bundle.
 * - Only `transform` (translate) is animated — GPU-composited, no repaints.
 * - Respects `prefers-reduced-motion`: renders static orbs with no animation.
 * - Max 3 orb instances enforced by component design.
 *
 * @example
 * ```tsx
 * <AmbientGlow intensity="medium" className="rounded-2xl" />
 * ```
 */

import { useEffect, useRef, useState } from 'react'
import { loadGsap } from './loadGsap'

type Intensity = 'subtle' | 'medium'

type AmbientGlowProps = Readonly<{
  /** Controls orb opacity and drift range. @default 'subtle' */
  intensity?: Intensity | undefined
  /** Additional CSS classes applied to the container. */
  className?: string | undefined
}>

/** Opacity per intensity level */
const OPACITY: Record<Intensity, number> = {
  subtle: 0.06,
  medium: 0.12,
}

/** Drift distance (px) per intensity level */
const DRIFT: Record<Intensity, number> = {
  subtle: 20,
  medium: 40,
}

/** Orb definitions — at most 3. The third only renders at 'medium' intensity. */
const ORB_DEFS = [
  {
    /** Accent violet */
    gradient: (opacity: number) =>
      `radial-gradient(circle, oklch(65% 0.25 290 / ${opacity}) 0%, transparent 70%)`,
    style: { width: '60%', height: '60%', top: '10%', left: '5%' } as const,
    durationRange: [18, 25] as const,
  },
  {
    /** Muted violet */
    gradient: (opacity: number) =>
      `radial-gradient(circle, oklch(50% 0.18 290 / ${opacity}) 0%, transparent 70%)`,
    style: { width: '50%', height: '50%', top: '30%', right: '5%' } as const,
    durationRange: [15, 22] as const,
  },
  {
    /** Success green tint — medium intensity only */
    gradient: (opacity: number) =>
      `radial-gradient(circle, oklch(70% 0.18 145 / ${opacity}) 0%, transparent 70%)`,
    style: { width: '45%', height: '45%', bottom: '5%', left: '25%' } as const,
    durationRange: [20, 25] as const,
    mediumOnly: true,
  },
] as const

export function AmbientGlow({ intensity = 'subtle', className }: AmbientGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect reduced-motion preference on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
  }, [])

  // Animate orbs with GSAP (skipped when reduced motion is preferred)
  useEffect(() => {
    if (prefersReducedMotion) return

    const container = containerRef.current
    if (!container) return

    let cancelled = false

    async function animate() {
      const gsap = await loadGsap()
      if (cancelled || !container) return

      const orbs = container.querySelectorAll<HTMLDivElement>('[data-orb]')
      const drift = DRIFT[intensity]

      orbs.forEach((orb, i) => {
        const def = ORB_DEFS[i]
        if (!def) return

        const [minDur, maxDur] = def.durationRange
        const duration = minDur + Math.random() * (maxDur - minDur)

        // Random initial offset so orbs don't start in sync
        const startX = (Math.random() - 0.5) * drift
        const startY = (Math.random() - 0.5) * drift

        gsap.set(orb, { x: startX, y: startY })

        gsap.to(orb, {
          x: (Math.random() - 0.5) * drift * 2,
          y: (Math.random() - 0.5) * drift * 2,
          duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    }

    animate()

    return () => {
      cancelled = true
      // Kill all tweens on orb elements
      const orbs = container.querySelectorAll<HTMLDivElement>('[data-orb]')
      orbs.forEach(async (orb) => {
        const gsap = await loadGsap()
        gsap.killTweensOf(orb)
      })
    }
  }, [prefersReducedMotion, intensity])

  const opacity = OPACITY[intensity]
  const visibleOrbs = ORB_DEFS.filter(
    (def) => !('mediumOnly' in def && def.mediumOnly) || intensity === 'medium',
  )

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: -1,
      }}
      aria-hidden="true"
    >
      {visibleOrbs.map((def, i) => (
        <div
          key={i}
          data-orb=""
          style={{
            position: 'absolute',
            ...def.style,
            background: def.gradient(opacity),
            willChange: prefersReducedMotion ? 'auto' : 'transform',
          }}
        />
      ))}
    </div>
  )
}
