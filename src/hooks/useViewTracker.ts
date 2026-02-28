/**
 * Hook to track view count for categories and products
 * Automatically sends view tracking when user clicks on items
 */

import { useCallback } from 'react';
import { API_BASE_URL, API_PUBLIC_CATEGORY_VIEW, API_PUBLIC_PRODUCT_VIEW } from '@/constants/api';

type ViewType = 'category' | 'product';

interface UseViewTrackerReturn {
  trackView: (id: string, type: ViewType) => Promise<void>;
}

export const useViewTracker = (): UseViewTrackerReturn => {
  const trackView = useCallback(async (id: string, type: ViewType) => {
    try {
      const endpoint = type === 'category' 
        ? API_PUBLIC_CATEGORY_VIEW(id) 
        : API_PUBLIC_PRODUCT_VIEW(id);

      await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`View tracked for ${type}:`, id);
    } catch (error) {
      console.error(`Failed to track view for ${type}:`, error);
      // Silently fail - don't interrupt user experience
    }
  }, []);

  return { trackView };
};
