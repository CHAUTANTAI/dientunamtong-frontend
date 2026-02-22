/**
 * Sidebar Menu Configuration
 * Single source of truth for admin menu structure with role-based visibility
 */

import React from 'react';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ROUTES } from './routes';
import { UserRole } from '@/types/auth';

// Admin menu configuration with role-based access
export interface AdminMenuItem {
  key: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  roles?: UserRole[]; // If specified, only these roles can see this item
  minRole?: UserRole; // If specified, user must have at least this role level
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: <DashboardOutlined />,
    // All roles can see dashboard
  },
  {
    key: 'category',
    label: 'Categories',
    href: ROUTES.CATEGORY,
    icon: <AppstoreOutlined />,
    minRole: UserRole.MANAGER, // Manager and Admin can access
  },
  {
    key: 'product',
    label: 'Products',
    href: ROUTES.PRODUCT,
    icon: <ShoppingOutlined />,
    minRole: UserRole.MANAGER, // Manager and Admin can access
  },
  {
    key: 'profile',
    label: 'Profile',
    href: ROUTES.PROFILE,
    icon: <UserOutlined />,
    // All roles can see profile
  },
];
