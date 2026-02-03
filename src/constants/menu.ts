/**
 * Sidebar Menu Configuration
 * Single source of truth for admin menu structure
 */

import React from 'react';
import { ROUTES } from './routes';

// Admin menu configuration — keep it simple and serializable
export interface AdminMenuItem {
  key: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
  },  {
    key: 'category',
    label: 'Category',
    href: ROUTES.CATEGORY,
  },
  {
    key: 'product',
    label: 'Product',
    href: ROUTES.PRODUCT,
  },
  {
    key: 'profile',
    label: 'Profile',
    href: ROUTES.PROFILE,
  },
];
