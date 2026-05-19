// Re-export env vars with type safety
// Add new env vars here — never access process.env directly in components

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
} as const
