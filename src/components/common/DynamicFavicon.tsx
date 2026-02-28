/**
 * DynamicFavicon Component
 * Updates favicon dynamically based on company logo
 */

'use client';

import { useEffect } from 'react';

interface DynamicFaviconProps {
  logoUrl?: string;
}

export default function DynamicFavicon({ logoUrl }: DynamicFaviconProps) {
  useEffect(() => {
    if (!logoUrl) return;

    // Find or create favicon link element
    let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // Update favicon
    link.href = logoUrl;

    // Also update apple-touch-icon if exists
    const appleTouchIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (appleTouchIcon) {
      appleTouchIcon.href = logoUrl;
    }
  }, [logoUrl]);

  return null;
}
