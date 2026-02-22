'use client';

import { useParams } from 'next/navigation';
import { useGetProductQuery } from '@/store/api/productApi';
import { ProductForm } from '@/components/product/ProductForm';

export default function AdminProductEditPage() {
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading } = useGetProductQuery(productId);

  return <ProductForm mode="edit" product={product} isLoading={isLoading} />;
}
