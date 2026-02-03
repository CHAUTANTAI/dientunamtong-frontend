/**
 * useAuth Hook
 * Custom hook for authentication state and operations
 */

'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreAuth, clearAuth } from '@/store/slices/authSlice';
import { getAuthToken, getAuthUser, saveAuthToken, saveAuthUser } from '@/utils/auth';
import type { AuthUser } from '@/types/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Restore auth from localStorage on mount
  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();

    if (token && user) {
      dispatch(restoreAuth({ token, user }));
    }
  }, [dispatch]);

  /**
   * Login helper
   */
  const login = (user: AuthUser, token: string) => {
    saveAuthToken(token);
    saveAuthUser(user);
    dispatch(restoreAuth({ user, token }));
  };

  /**
   * Logout helper
   */
  const logout = () => {
    dispatch(clearAuth());
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return {
    ...auth,
    login,
    logout,
  };
};
