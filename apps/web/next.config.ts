import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Server-first architecture
  experimental: {
    typedRoutes: true,
  },

  // Image optimization for game artwork
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.continue.app',
      },
    ],
  },

  // Strict mode for React
  reactStrictMode: true,

  // Redirect trailing slashes
  trailingSlash: false,

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? '0.0.0',
  },
}

export default nextConfig
