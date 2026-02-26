/**
 * Route Constants
 * Single source of truth for all routes in the application
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/auth/login',

  // Admin routes
  DASHBOARD: '/admin/dashboard',
  CATEGORY: '/admin/category',
  PRODUCT: '/admin/product',
  PROFILE: '/admin/profile',

  ADMIN_ROOT: '/',

  // Can be extended with more admin routes
  // USERS: '/users',
  // SETTINGS: '/settings',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

// src/constants/admin-routes.ts
export interface AdminRoute {
  path: string;
  label: string;
  labelKey: string; // Translation key
  parent?: string;
}

export const ADMIN_ROUTES: AdminRoute[] = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    labelKey: 'navigation.dashboard',
  },
  {
    path: '/admin/category',
    label: 'Category',
    labelKey: 'navigation.categories',
    parent: '/admin',
  },
  {
    path: '/admin/category/create',
    label: 'Create Category',
    labelKey: 'category.create',
    parent: '/admin/category',
  },
  {
    path: '/admin/product',
    label: 'Product',
    labelKey: 'navigation.products',
    parent: '/admin',
  },
  {
    path: '/admin/product/create',
    label: 'Create Product',
    labelKey: 'product.create',
    parent: '/admin/product',
  },
  {
    path: '/admin/profile',
    label: 'Profile',
    labelKey: 'navigation.profile',
    parent: '/admin',
  },
];
