'use client'

/**
 * Premium transform-based reveal animation.
 *
 * Uses `translateY` + `opacity` with editorial easing for a polished,
 * cinematic entrance. This is intentionally **not** clip-path based —
 * only GPU-composited properties are animated for maximum performance.
 *
 * @example
 * ```tsx
 * <MotionReveal delay={0.2}>
 *   <HeroHeadline />
 * </MotionReveal>
 * ```
 */

import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { durations, easings, viewportDefaults } from '@/components/motion/motion-config'

type MotionRevealProps = Readonly<{
  delay?: number
  duration?: number
  className?: string
  children: ReactNode
}>

export function MotionReveal({
  delay = 0,
  duration = durations.slow,
  className,
  children,
}: MotionRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: viewportDefaults.margin }}
      transition={{
        duration,
        delay,
        ease: easings.editorial,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
