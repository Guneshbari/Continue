/**
 * Lazy GSAP loader — ensures `gsap` is never part of the initial bundle.
 *
 * @example
 * ```ts
 * const gsap = await loadGsap()
 * gsap.to(el, { opacity: 1, duration: 0.5 })
 * ```
 */

import type gsapModule from 'gsap'

let gsapInstance: typeof gsapModule | null = null

export async function loadGsap(): Promise<typeof gsapModule> {
  if (!gsapInstance) {
    const mod = await import('gsap')
    gsapInstance = mod.default ?? (mod as unknown as typeof gsapModule)
  }
  return gsapInstance
}
