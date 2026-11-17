import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@electric-sql/pglite'],
  allowedDevOrigins: [
    'pv-b6cac40e5aff-72504f92-6c38-4bc3-beb8-bafdfe029c4c.style.dev',
    '*.style.dev',
  ],
  eslint: { ignoreDuringBuilds: true },
  devIndicators: false,
}

export default nextConfig
