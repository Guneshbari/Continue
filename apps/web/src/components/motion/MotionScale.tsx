'use client'

/**
 * Hover/tap scale interaction primitive.
 *
 * Adds a subtle scale-up on hover and scale-down on tap for tactile
 * feedback on interactive elements like cards, buttons, and thumbnails.
 * Uses snappy spring physics for a responsive feel.
 *
 * @example
 * ```tsx
 * <MotionScale hoverScale={1.03}>
 *   <GameCard />
 * </MotionScale>
 * ```
 */

import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { springPresets } from '@/components/motion/motion-config'

type MotionScaleProps = Readonly<{
  hoverScale?: number
  tapScale?: number
  className?: string
  children: ReactNode
}>

export function MotionScale({
  hoverScale = 1.02,
  tapScale = 0.98,
  className,
  children,
}: MotionScaleProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={springPresets.snappy}
      className={className}
    >
      {children}
    </motion.div>
  )
}
