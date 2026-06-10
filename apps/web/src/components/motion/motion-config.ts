/**
 * Shared motion configuration — single source of truth for all animation
 * timing, easing, spring physics, stagger, and viewport presets.
 *
 * Import from `@/components/motion/motion-config` in any motion component.
 * This module is pure data (no React, no `'use client'`).
 */

/** Durations in seconds (for motion library) */
export const durations = {
  fast: 0.15,
  standard: 0.3,
  slow: 0.5,
  editorial: 0.8,
} as const

/** Easing curves (matching CSS tokens in globals.css) */
export const easings = {
  standard: [0.4, 0, 0.2, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  editorial: [0.16, 1, 0.3, 1] as const,
}

/** Spring physics presets for motion library */
export const springPresets = {
  gentle: { type: 'spring' as const, stiffness: 120, damping: 14, mass: 1 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 24, mass: 0.8 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 10, mass: 0.5 },
}

/** Stagger timing presets (seconds between each child) */
export const staggerPresets = {
  fast: 0.04,
  standard: 0.08,
  editorial: 0.15,
} as const

/** Standard viewport detection config */
export const viewportDefaults = {
  once: true,
  margin: '-80px' as const,
}
