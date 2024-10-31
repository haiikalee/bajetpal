import type { NextConfig } from 'next/dist/server/config'

const nextConfig: NextConfig = {
  images: {
    domains: ['your-domain.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
