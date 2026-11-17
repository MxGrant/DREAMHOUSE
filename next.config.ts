import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'pv-b6cac40e5aff-72504f92-6c38-4bc3-beb8-bafdfe029c4c.style.dev',
    '*.style.dev',
  ],
  devIndicators: false,
}

export default nextConfig
