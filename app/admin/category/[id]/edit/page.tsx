/**
 * Edit Category Page Route
 */

import AdminCategoryEditPage from '@/screens/admin/category/admin-category-edit-page';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <AdminCategoryEditPage categoryId={params.id} />;
}

