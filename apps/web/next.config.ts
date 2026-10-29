import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@linkora/shared', '@linkora/i18n'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async rewrites() {
    const backendUrl =
      process.env.API_URL ||
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
