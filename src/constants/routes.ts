/**
 * Route Constants
 * Single source of truth for all routes in the application
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',

  // Admin routes
  DASHBOARD: '/dashboard',
  ADMIN_ROOT: '/',

  // Can be extended with more admin routes
  // USERS: '/users',
  // SETTINGS: '/settings',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
