'use client'

/**
 * Viewport-triggered fade with configurable direction.
 *
 * This is the workhorse animation component. It fades content in from a
 * given direction when it scrolls into view — using only GPU-composited
 * properties (`transform` and `opacity`).
 *
 * @example
 * ```tsx
 * <MotionFade direction="up" delay={0.1}>
 *   <Card />
 * </MotionFade>
 * ```
 */

import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { durations, easings, viewportDefaults } from '@/components/motion/motion-config'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

type MotionFadeProps = Readonly<{
  direction?: Direction
  delay?: number
  duration?: number
  distance?: number
  viewportMargin?: string
  className?: string
  children: ReactNode
}>

/** Map a direction to initial x/y offsets. */
function getOffset(direction: Direction, distance: number): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance }
    case 'down':
      return { x: 0, y: -distance }
    case 'left':
      return { x: distance, y: 0 }
    case 'right':
      return { x: -distance, y: 0 }
    case 'none':
      return { x: 0, y: 0 }
  }
}

export function MotionFade({
  direction = 'up',
  delay = 0,
  duration = durations.standard,
  distance = 24,
  viewportMargin = viewportDefaults.margin,
  className,
  children,
}: MotionFadeProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = getOffset(direction, distance)

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{
        duration,
        delay,
        ease: easings.decelerate,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
