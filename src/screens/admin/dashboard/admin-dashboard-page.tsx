/*
 * Dashboard Page
 * Admin dashboard home page
 */

'use client';

import { Card } from 'antd';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <>
      <Card>
        <h3>{t('dashboard.welcome')}</h3>
        <p>{t('dashboard.description')}</p>
      </Card>
    </>
  );
}
