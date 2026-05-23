// Re-export env vars with type safety
// Add new env vars here — never access process.env directly in components

export const env = {
  /** Public API URL — used by browser-side fetch calls */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',

  /**
   * Internal API URL — used by server-side (SSR/RSC) fetch calls.
   * In Docker: set to http://api:3001/api/v1 to skip external networking.
   * Defaults to apiUrl for local dev compatibility.
   */
  internalApiUrl: process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',

  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
} as const
