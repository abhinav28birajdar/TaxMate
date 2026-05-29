// next.config.enhanced.ts
// Enhanced Next.js configuration for production

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React settings
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '8mb',
  },

  // Compression
  compress: true,

  // PoweredBy header removal
  poweredByHeader: false,

  // Environment variables
  env: {
    APP_VERSION: process.env.npm_package_version || '1.0.0',
    BUILD_TIME: new Date().toISOString(),
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard/:path*',
        destination: '/login',
        permanent: false,
        missing: [{ type: 'cookie', key: 'token' }],
      },
    ];
  },

  // Rewrites
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize bundles
    config.optimization.usedExports = true;

    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },

  // Performance optimizations
  productionBrowserSourceMaps: false, // Disable in production for security
  optimizeFonts: true,

  // TypeScript
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // ESLint
  eslint: {
    dirs: ['src', 'pages', 'components', 'lib', 'utils'],
  },
};

export default nextConfig;
