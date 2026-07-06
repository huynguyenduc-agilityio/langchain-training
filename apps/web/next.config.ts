import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for Docker/Railway deployment — generates a self-contained server bundle
  output: 'standalone',
  // Needed for Vercel to resolve internal workspace packages (@repo/shared, @repo/logger)
  transpilePackages: ['@repo/shared', '@repo/logger'],
  // Keep turbopack root only for local development via env guard
  ...(process.env.NODE_ENV !== 'production' && {
    turbopack: {
      root: '../..',
    },
  }),
};

export default nextConfig;
