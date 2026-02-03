/**
 * useNavigation Hook
 * Custom hook for navigation and menu state
 */

'use client';

import { useState } from 'react';

export const useNavigation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
  };
};
