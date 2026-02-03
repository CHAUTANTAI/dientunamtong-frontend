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
  },
  // Add more menu items as needed
  // {
  //   key: 'users',
  //   label: 'Users',
  //   href: ROUTES.USERS,
  // },
];
