import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // Fix for Vercel middleware tracing issue (Next.js 16+)
  outputFileTracingIncludes: {
    '/api/**/*': ['./src/**/*'],
    '/[locale]/**/*': ['./src/**/*'],
  },
};

export default withNextIntl(nextConfig);
