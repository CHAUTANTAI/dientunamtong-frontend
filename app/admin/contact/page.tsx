/**
 * Admin Contact List Page Route
 * Displays all contact submissions from customers
 */

import { Metadata } from 'next';
import AdminContactPage from '@/screens/admin/contact/admin-contact-page';

export const metadata: Metadata = {
  title: 'Contact Management | Admin Panel',
  description: 'Manage customer contact submissions',
};

export default function ContactListPage() {
  return <AdminContactPage />;
}
