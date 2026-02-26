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
  labelKey: string; // Translation key
  href?: string;
  icon?: React.ReactNode;
  roles?: UserRole[];
  minRole?: UserRole;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    labelKey: 'navigation.dashboard',
    href: ROUTES.DASHBOARD,
    icon: <DashboardOutlined />,
  },
  {
    key: 'category',
    label: 'Categories',
    labelKey: 'navigation.categories',
    href: ROUTES.CATEGORY,
    icon: <AppstoreOutlined />,
    minRole: UserRole.MANAGER,
  },
  {
    key: 'product',
    label: 'Products',
    labelKey: 'navigation.products',
    href: ROUTES.PRODUCT,
    icon: <ShoppingOutlined />,
    minRole: UserRole.MANAGER,
  },
  {
    key: 'profile',
    label: 'Profile',
    labelKey: 'navigation.profile',
    href: ROUTES.PROFILE,
    icon: <UserOutlined />,
  },
];
