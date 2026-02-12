/**
 * Edit Category Page Route
 */

import AdminCategoryEditPage from '@/screens/admin/category/admin-category-edit-page';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminCategoryEditPage categoryId={id} />;
}

