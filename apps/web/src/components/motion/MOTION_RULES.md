# Motion Rules — Continue Design System

> This document governs ALL animation and motion in the Continue platform.
> Every contributor MUST follow these rules. Violations will be caught in code review.

## Core Principles

1. **Motion is a design system concern, not a page concern.**
   All animations are reusable primitives in `src/components/motion/`.
   No page-specific animation logic. No inline `motion.div` with custom values.

2. **GPU-only animations.**
   Only animate `transform` and `opacity`. Never animate:
   - `width`, `height`, `max-width`, `max-height`
   - `margin`, `padding`, `gap`
   - `color`, `background-color`, `border-color`
   - `top`, `left`, `right`, `bottom`
   - `font-size`, `line-height`

3. **Accessibility first.**
   All motion components respect `prefers-reduced-motion`.
   When reduced motion is preferred, components render instantly with zero animation.

4. **No infinite loops** except ambient systems (`AmbientGlow`).
   All viewport animations trigger `once: true` — they never replay on scroll.

5. **Motion budget: 3 elements per viewport.**
   Maximum 3 simultaneously animating elements in any viewport.
   Staggers count as 1 element (the container orchestrates timing).

---

## Library Responsibilities

| Library        | Usage                                   | Bundle Strategy        |
| -------------- | --------------------------------------- | ---------------------- |
| Motion (React) | UI interactions, page transitions       | Standard import        |
| GSAP           | Editorial hero effects, ambient systems | **Lazy dynamic import** |

### GSAP Rules
- **NEVER** import GSAP at the top level
- **ALWAYS** use `loadGsap()` from `@/components/motion/loadGsap`
- GSAP is **forbidden** for: buttons, forms, lists, cards, modals, navigation
- GSAP is **allowed** for: hero backgrounds, ambient particles, editorial reveals

---

## Timing Tokens

All durations come from `motion-config.ts`. Never hardcode timing values.

| Token      | Duration | Usage                              |
| ---------- | -------- | ---------------------------------- |
| `fast`     | 150ms    | Micro-interactions, button press   |
| `standard` | 300ms    | Default transitions, reveals       |
| `slow`     | 500ms    | Emphasis reveals, modal entrances  |
| `editorial`| 800ms    | GSAP ambient drift, hero effects   |

## Easing Curves

| Token        | Curve                          | Usage                              |
| ------------ | ------------------------------ | ---------------------------------- |
| `standard`   | `cubic-bezier(0.4, 0, 0.2, 1)` | Default transitions                |
| `decelerate` | `cubic-bezier(0, 0, 0.2, 1)`   | Elements entering the viewport     |
| `accelerate` | `cubic-bezier(0.4, 0, 1, 1)`   | Elements leaving the viewport      |
| `spring`     | `cubic-bezier(0.34,1.56,0.64,1)`| Bouncy interactive feedback       |
| `editorial`  | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth editorial reveals          |

---

## Primitive Inventory

| Component         | Type    | Purpose                           |
| ----------------- | ------- | --------------------------------- |
| `MotionFade`      | Motion  | Viewport-triggered directional fade |
| `MotionStagger`   | Motion  | Orchestrated child stagger          |
| `MotionPresence`  | Motion  | Mount/unmount animation             |
| `MotionReveal`    | Motion  | Premium editorial reveal            |
| `MotionScale`     | Motion  | Hover/tap scale interaction         |
| `MotionCounter`   | Motion  | Animated number counter             |
| `RouteTransition` | Motion  | Page transition wrapper             |
| `AmbientGlow`     | GSAP    | Floating gradient orbs              |

---

## Anti-Patterns

### ❌ Don't do this
```tsx
// Page-specific inline animation
<motion.div animate={{ x: 100, backgroundColor: '#ff0000' }}>
```

### ✅ Do this instead
```tsx
// Use a design system primitive
<MotionFade direction="left">
  <GameCard />
</MotionFade>
```

### ❌ Don't do this
```tsx
// Animating layout properties
<motion.div animate={{ width: '100%', height: 200 }}>
```

### ✅ Do this instead
```tsx
// Only transform and opacity
<motion.div animate={{ scale: 1, opacity: 1 }}>
```

### ❌ Don't do this
```tsx
// Top-level GSAP import
import gsap from 'gsap'
```

### ✅ Do this instead
```tsx
// Lazy load GSAP
import { loadGsap } from '@/components/motion/loadGsap'
const gsap = await loadGsap()
```
