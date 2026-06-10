'use client'

/**
 * Mount/unmount animation wrapper.
 *
 * Wraps content that conditionally appears and disappears with a subtle
 * fade + scale transition. Uses `AnimatePresence` so exit animations
 * complete before the DOM node is removed.
 *
 * @example
 * ```tsx
 * <MotionPresence show={isOpen}>
 *   <DropdownMenu />
 * </MotionPresence>
 * ```
 */

import { type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { durations, easings } from '@/components/motion/motion-config'

type MotionPresenceProps = Readonly<{
  show: boolean
  className?: string | undefined
  children: ReactNode
}>

export function MotionPresence({ show, className, children }: MotionPresenceProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return show ? <div className={className}>{children}</div> : null
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{
            duration: durations.fast,
            ease: easings.decelerate,
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
