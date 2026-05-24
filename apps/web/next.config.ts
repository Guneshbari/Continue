import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.continue.app' },
      { protocol: 'https', hostname: 'images.igdb.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  reactStrictMode: true,
  trailingSlash: false,

  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? '0.0.0',
  },
}

export default nextConfig
