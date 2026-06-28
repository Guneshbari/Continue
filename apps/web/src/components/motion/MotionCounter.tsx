'use client'

/**
 * Animated number counter for statistics.
 *
 * Smoothly counts from `from` to `to` when the element scrolls into view.
 * The displayed value is formatted with `Intl.NumberFormat` for proper
 * locale-aware number rendering (commas, decimals, etc.).
 *
 * @example
 * ```tsx
 * <MotionCounter to={12500} className="text-3xl font-bold" />
 * <MotionCounter
 *   to={99.9}
 *   duration={1.2}
 *   formatOptions={{ minimumFractionDigits: 1 }}
 * />
 * ```
 */

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useTransform, animate, useReducedMotion } from 'motion/react'
import { durations, easings } from '@/components/motion/motion-config'

type MotionCounterProps = Readonly<{
  from?: number | undefined
  to: number
  duration?: number | undefined
  locale?: string | undefined
  formatOptions?: Intl.NumberFormatOptions | undefined
  className?: string | undefined
}>

export function MotionCounter({
  from = 0,
  to,
  duration = durations.editorial,
  locale = 'en-US',
  formatOptions,
  className,
}: MotionCounterProps) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(from)
  const isInView = useInView(ref, { once: true })

  const formatter = new Intl.NumberFormat(locale, formatOptions)

  const displayed = useTransform(motionValue, (latest) => formatter.format(latest))

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return

    const controls = animate(motionValue, to, {
      duration,
      ease: easings.decelerate,
    })

    return () => controls.stop()
  }, [isInView, prefersReducedMotion, motionValue, to, duration])

  // Update the DOM text whenever `displayed` changes.
  useEffect(() => {
    const unsubscribe = displayed.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest
      }
    })
    return unsubscribe
  }, [displayed])

  // If reduced motion, show final value immediately.
  if (prefersReducedMotion) {
    return <span className={className}>{formatter.format(to)}</span>
  }

  return (
    <span ref={ref} className={className}>
      {formatter.format(from)}
    </span>
  )
}
