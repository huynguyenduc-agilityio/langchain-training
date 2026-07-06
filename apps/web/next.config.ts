import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Needed to resolve internal workspace packages (@repo/shared, @repo/logger)
  transpilePackages: ['@repo/shared', '@repo/logger'],
  // Keep turbopack root only for local development via env guard
  ...(process.env.NODE_ENV !== 'production' && {
    turbopack: {
      root: '../..',
    },
  }),
};

export default nextConfig;
