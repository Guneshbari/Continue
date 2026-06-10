'use client'

/**
 * Page transition wrapper for Next.js App Router.
 *
 * Uses `usePathname()` as the `key` for `AnimatePresence` so route
 * changes trigger a smooth enter/exit animation. Wrap your page or
 * layout content with this component.
 *
 * @example
 * ```tsx
 * // In a layout.tsx
 * <RouteTransition>
 *   {children}
 * </RouteTransition>
 * ```
 */

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { durations, easings } from '@/components/motion/motion-config'

type RouteTransitionProps = Readonly<{
  children: ReactNode
  className?: string
}>

export function RouteTransition({ children, className }: RouteTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: durations.fast,
          ease: easings.decelerate,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
