import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@xyflow/react'],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiBase = (
      process.env.INTERNAL_API_URL || 'http://127.0.0.1:4000'
    ).replace(/\/$/, '');
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
