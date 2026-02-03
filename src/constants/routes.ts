/**
 * Route Constants
 * Single source of truth for all routes in the application
 */

export const ROUTES = {
  // Public routes
  LOGIN: "/admin/auth/login",

  // Admin routes
  DASHBOARD: "/admin/dashboard",
  CATEGORY: "/admin/category",
  PRODUCT: "/admin/product",
  PROFILE: "/admin/profile",

  ADMIN_ROOT: "/",

  // Can be extended with more admin routes
  // USERS: '/users',
  // SETTINGS: '/settings',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

// src/constants/admin-routes.ts
export interface AdminRoute {
  path: string;
  label: string;
  parent?: string;
}

export const ADMIN_ROUTES: AdminRoute[] = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
  },
  {
    path: "/admin/category",
    label: "Category",
    parent: "/admin",
  },
  {
    path: "/admin/product",
    label: "Product",
    parent: "/admin",
  },
  {
    path: "/admin/product/create",
    label: "Create Product",
    parent: "/admin/product",
  },
  {
    path: "/admin/profile",
    label: "Profile",
    parent: "/admin",
  }
];
