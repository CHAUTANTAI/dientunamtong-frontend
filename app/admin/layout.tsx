/*
 * Admin Layout
 * Main layout for all admin pages
 * Auth protection is handled by proxy.ts (server-side)
 */

'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  // No client-side auth check needed - proxy.ts handles this at server level
  // This prevents race conditions and unnecessary redirects on page refresh
  return <AdminLayout>{children}</AdminLayout>;
}
