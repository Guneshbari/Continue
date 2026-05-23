'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type AnimatedSectionProps = Readonly<{
  children: ReactNode
  className?: string
  /** Delay in seconds before animation starts (for staggering sections) */
  delay?: number
}>

/**
 * Lightweight viewport-triggered entrance animation wrapper.
 * Respects prefers-reduced-motion — no animation if user prefers reduced motion.
 * Triggers once on scroll-into-view, never replays.
 * No parallax, no GPU-heavy effects, no scroll-jacking.
 */
export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
