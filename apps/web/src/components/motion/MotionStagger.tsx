'use client'

/**
 * Staggered animation container and item pair.
 *
 * `MotionStagger` is the orchestrating container — it triggers a staggered
 * reveal of its children when it enters the viewport.
 *
 * `MotionStaggerItem` wraps each child that should participate in the
 * stagger sequence. This split gives consumers full control over which
 * elements animate.
 *
 * @example
 * ```tsx
 * <MotionStagger preset="standard">
 *   {items.map((item) => (
 *     <MotionStaggerItem key={item.id}>
 *       <Card {...item} />
 *     </MotionStaggerItem>
 *   ))}
 * </MotionStagger>
 * ```
 */

import { type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { durations, easings, staggerPresets, viewportDefaults } from '@/components/motion/motion-config'

type StaggerPreset = keyof typeof staggerPresets

type MotionStaggerProps = Readonly<{
  preset?: StaggerPreset
  viewportMargin?: string
  className?: string
  children: ReactNode
}>

type MotionStaggerItemProps = Readonly<{
  className?: string
  children: ReactNode
}>

const containerVariants: Record<StaggerPreset, Variants> = {
  fast: {
    hidden: {},
    visible: { transition: { staggerChildren: staggerPresets.fast } },
  },
  standard: {
    hidden: {},
    visible: { transition: { staggerChildren: staggerPresets.standard } },
  },
  editorial: {
    hidden: {},
    visible: { transition: { staggerChildren: staggerPresets.editorial } },
  },
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.standard,
      ease: easings.decelerate,
    },
  },
}

export function MotionStagger({
  preset = 'standard',
  viewportMargin = viewportDefaults.margin,
  className,
  children,
}: MotionStaggerProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={containerVariants[preset]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: viewportMargin }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function MotionStaggerItem({ className, children }: MotionStaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  )
}
