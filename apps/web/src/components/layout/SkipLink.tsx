'use client'

/**
 * WCAG SkipLink Accessibility Navigation
 * Enforces keyboard sweep skips straight to main content boundaries.
 */
export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  )
}
