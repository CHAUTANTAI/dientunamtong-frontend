'use client';

import { use } from 'react';
import ClientLayout from '@/components/layout/ClientLayout';
import CategoryDetailPage from '@/screens/client/categories/category-detail-page';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function CategoryPage({ params }: Props) {
  const { id } = use(params);

  return (
    <ClientLayout>
      <CategoryDetailPage categoryId={id} />
    </ClientLayout>
  );
}
