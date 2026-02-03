/**
 * Authentication Utilities
 * Helper functions for auth operations
 */

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
import type { AuthUser } from '@/types/auth';

/**
 * Save authentication token to localStorage
 */
export const saveAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

/**
 * Save user data to localStorage
 */
export const saveAuthUser = (user: AuthUser): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get user data from localStorage
 */
export const getAuthUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? (JSON.parse(user) as AuthUser) : null;
  }
  return null;
};

/**
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
