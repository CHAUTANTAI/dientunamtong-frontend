/**
 * Role-Based Access Control (RBAC) Utilities
 * Utilities for managing role-based permissions
 */

import { UserRole } from '@/types/auth';

/**
 * Role hierarchy (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.STAFF]: 1,
  [UserRole.MANAGER]: 2,
  [UserRole.ADMIN]: 3,
};

/**
 * Check if user has a specific role
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

/**
 * Check if user has at least the required role level
 * (e.g., ADMIN has access to MANAGER and STAFF level resources)
 */
export const hasMinimumRole = (
  userRole: UserRole,
  minimumRole: UserRole
): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
};

/**
 * Check if user has ANY of the required roles
 */
export const hasAnyRole = (
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean => {
  return requiredRoles.includes(userRole);
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN;
};

/**
 * Check if user is manager or above
 */
export const isManagerOrAbove = (userRole: UserRole): boolean => {
  return hasMinimumRole(userRole, UserRole.MANAGER);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.MANAGER]: 'Manager',
    [UserRole.STAFF]: 'Staff',
  };
  return displayNames[role] || role;
};

/**
 * Get role color for UI (Ant Design Tag colors)
 */
export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'red',
    [UserRole.MANAGER]: 'blue',
    [UserRole.STAFF]: 'green',
  };
  return colors[role] || 'default';
};

/**
 * Check permissions for specific actions
 */
export interface Permission {
  // Category permissions
  canCreateCategory: boolean;
  canEditCategory: boolean;
  canDeleteCategory: boolean;
  canViewCategory: boolean;
  
  // Product permissions
  canCreateProduct: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canViewProduct: boolean;
  
  // Contact permissions
  canViewContacts: boolean;
  canManageContacts: boolean;
  
  // User management permissions
  canManageUsers: boolean;
  
  // Settings permissions
  canEditSettings: boolean;
}

/**
 * Get permissions based on role
 */
export const getPermissions = (role: UserRole | null): Permission => {
  const basePermissions: Permission = {
    canCreateCategory: false,
    canEditCategory: false,
    canDeleteCategory: false,
    canViewCategory: false,
    canCreateProduct: false,
    canEditProduct: false,
    canDeleteProduct: false,
    canViewProduct: false,
    canViewContacts: false,
    canManageContacts: false,
    canManageUsers: false,
    canEditSettings: false,
  };

  if (!role) {
    return basePermissions;
  }

  switch (role) {
    case UserRole.ADMIN:
      return {
        canCreateCategory: true,
        canEditCategory: true,
        canDeleteCategory: true,
        canViewCategory: true,
        canCreateProduct: true,
        canEditProduct: true,
        canDeleteProduct: true,
        canViewProduct: true,
        canViewContacts: true,
        canManageContacts: true,
        canManageUsers: true,
        canEditSettings: true,
      };

    case UserRole.MANAGER:
      return {
        ...basePermissions,
        canCreateCategory: true,
        canEditCategory: true,
        canDeleteCategory: false, // Cannot delete
        canViewCategory: true,
        canCreateProduct: true,
        canEditProduct: true,
        canDeleteProduct: false, // Cannot delete
        canViewProduct: true,
        canViewContacts: true,
        canManageContacts: true,
        canManageUsers: false,
        canEditSettings: false,
      };

    case UserRole.STAFF:
      return {
        ...basePermissions,
        canCreateCategory: false,
        canEditCategory: false,
        canDeleteCategory: false,
        canViewCategory: true,
        canCreateProduct: false,
        canEditProduct: false,
        canDeleteProduct: false,
        canViewProduct: true,
        canViewContacts: true,
        canManageContacts: false,
        canManageUsers: false,
        canEditSettings: false,
      };

    default:
      return basePermissions;
  }
};

/**
 * Example usage:
 * 
 * const permissions = getPermissions(user.role);
 * if (permissions.canDeleteCategory) {
 *   // Show delete button
 * }
 * 
 * if (isAdmin(user.role)) {
 *   // Show admin panel
 * }
 */

