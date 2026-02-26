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

  // fallback
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];

  return last ? last.toUpperCase() : t('navigation.dashboard');
};
