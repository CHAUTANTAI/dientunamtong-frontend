/*
 * Admin Layout
 * Main layout for all admin pages
 * Auth protection is handled by proxy.ts (server-side)
 */

import { AdminLayout } from '@/components/layout/AdminLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin system for managing applications',
};

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  // No client-side auth check needed - proxy.ts handles this at server level
  // This prevents race conditions and unnecessary redirects on page refresh
  return <AdminLayout>{children}</AdminLayout>;
}
