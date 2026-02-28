import ClientLayout from '@/components/layout/ClientLayout';
import ProductDetailPage from '@/screens/client/products/product-detail-page';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  return (
    <ClientLayout>
      <ProductDetailPage productId={id} />
    </ClientLayout>
  );
}
