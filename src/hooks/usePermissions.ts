/**
 * usePermissions Hook
 * Hook for accessing user permissions based on their role
 */

'use client';

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { getPermissions, type Permission } from '@/utils/rbac';

export const usePermissions = (): Permission => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) {
      // Return empty permissions if not logged in
      return getPermissions(null as any);
    }
    return getPermissions(user.role);
  }, [user]);

  return permissions;
};

