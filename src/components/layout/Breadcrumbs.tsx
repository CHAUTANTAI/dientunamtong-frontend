/**
 * Breadcrumbs Component
 * Page breadcrumbs navigation
 */

'use client';

import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

interface BreadcrumbItem {
  title: React.ReactNode;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  // Generate breadcrumbs from pathname if items not provided
  const defaultItems: BreadcrumbItem[] = [
    { title: <HomeOutlined />, href: ROUTES.DASHBOARD },
  ];

  if (!items) {
    items = defaultItems;
  }

  const breadcrumbItems = items.map((item) => ({
    title: item.href ? <Link href={item.href}>{item.title}</Link> : item.title,
  }));

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{
        marginBottom: '16px',
      }}
    />
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';
