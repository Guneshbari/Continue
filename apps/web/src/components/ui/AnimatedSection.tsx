'use client'

import { MotionFade } from '@/components/motion'
import type { ReactNode } from 'react'

type AnimatedSectionProps = Readonly<{
  children: ReactNode
  className?: string
  /** Delay in seconds before animation starts (for staggering sections) */
  delay?: number
}>

/**
 * @deprecated Use `MotionFade` directly for more control.
 * Thin backward-compatible wrapper around MotionFade.
 *
 * @example
 * ```tsx
 * // Before (still works):
 * <AnimatedSection delay={0.1}><Content /></AnimatedSection>
 *
 * // Preferred:
 * <MotionFade direction="up" delay={0.1}><Content /></MotionFade>
 * ```
 */
export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <MotionFade direction="up" delay={delay} className={className}>
      {children}
    </MotionFade>
  )
}
