'use client';

import { ADMIN_ROUTES } from '@/constants/routes';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const usePageTitle = () => {
  const t = useTranslations();
  const pathname = usePathname();

  const route = ADMIN_ROUTES.find((r) => r.path === pathname);
  if (route && route.labelKey) {
    return t(route.labelKey);
  }

  // Check for dynamic routes
  // Contact detail page: /admin/contact/[id]
  if (pathname.startsWith('/admin/contact/') && pathname.split('/').length === 4) {
    return t('adminContact.details.title');
  }

  // Category edit page: /admin/category/[id]/edit
  if (pathname.match(/\/admin\/category\/[^/]+\/edit$/)) {
    return t('category.editTitle');
  }

  // Product edit page: /admin/product/[id]/edit
  if (pathname.match(/\/admin\/product\/[^/]+\/edit$/)) {
    return t('product.editTitle');
  }

  // Banner edit page: /admin/banner/[id]
  if (pathname.startsWith('/admin/banner/') && pathname.split('/').length === 4) {
    return t('banner.editTitle');
  }

  // fallback
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];

  return last ? last.charAt(0).toUpperCase() + last.slice(1) : t('navigation.dashboard');
};
