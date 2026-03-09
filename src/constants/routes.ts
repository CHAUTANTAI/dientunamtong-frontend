/**
 * Route Constants
 * Single source of truth for all routes in the application
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/auth/login',
  
  // Client routes
  HOME: '/',
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  CONTACT: '/contact',
  ABOUT: '/about',

  // Admin routes
  DASHBOARD: '/admin/dashboard',
  HOMEPAGE_EDITOR: '/admin/homepage-editor',
  CATEGORY: '/admin/category',
  PRODUCT: '/admin/product',
  BANNER: '/admin/banner',
  CONTACT_ADMIN: '/admin/contact',
  PROFILE: '/admin/profile',

  ADMIN_ROOT: '/admin',
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
    path: '/admin/homepage-editor',
    label: 'Homepage Editor',
    labelKey: 'navigation.homepageEditor',
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
    path: '/admin/banner',
    label: 'Banner',
    labelKey: 'navigation.banners',
    parent: '/admin',
  },
  {
    path: '/admin/banner/create',
    label: 'Create Banner',
    labelKey: 'banner.create',
    parent: '/admin/banner',
  },
  {
    path: '/admin/contact',
    label: 'Contact',
    labelKey: 'navigation.contact',
    parent: '/admin',
  },
  {
    path: '/admin/profile',
    label: 'Profile',
    labelKey: 'navigation.profile',
    parent: '/admin',
  },
];
