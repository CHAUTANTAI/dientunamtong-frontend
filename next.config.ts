import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.config.ts');

const nextConfig: NextConfig = {
  images: {
    /**
     * Required when `/_next/image` fetches storage from `http://localhost:4000/...`
     * (Next blocks private IPs by default → 400 "url parameter is not allowed").
     * Production CDN URLs (https://*.r2.dev, custom domain) are public IPs and do not need this.
     */
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
      /** Backend storage proxy (GET /api/public/storage/...) when R2_PUBLIC_URL is unset */
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/api/public/storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/api/public/storage/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
