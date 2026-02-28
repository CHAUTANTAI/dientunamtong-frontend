/**
 * Admin Contact Detail Page Route
 * View and manage individual contact submission
 */

import { Metadata } from 'next';
import AdminContactDetailPage from '@/screens/admin/contact/admin-contact-detail-page';

export const metadata: Metadata = {
  title: 'Contact Details | Admin Panel',
  description: 'View and manage contact submission',
};

export default function ContactDetailRoute() {
  return <AdminContactDetailPage />;
}
