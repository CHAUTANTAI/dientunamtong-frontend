'use client';

import { useState, useMemo } from 'react';
import { Row, Col, Card, Typography, Spin, Empty, TreeSelect, Input, Pagination, Space, Tag, Slider } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useViewTracker } from '@/hooks/useViewTracker';
import { ROUTES } from '@/constants/routes';

const { Title, Text } = Typography;

interface ProductCardProps {
  id: string;
  name: string;
  price?: string | number | null;
  imageUrl?: string;
  inStock?: boolean;
}

const ProductCard = ({ id, name, price, imageUrl, inStock }: ProductCardProps) => {
  const t = useTranslations('product.labels');
  const signedUrl = useSignedImageUrl(imageUrl || '');
  const { trackView } = useViewTracker();

  const formatPrice = (priceValue: string | number) => {
    const numPrice = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
  };

  const handleClick = () => {
    trackView(id, 'product');
  };

  return (
    <Link href={`${ROUTES.PRODUCTS}/${id}`} style={{ textDecoration: 'none' }} onClick={handleClick}>
      <Card hoverable style={{ height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {signedUrl ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 200,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Image src={signedUrl} alt={name} fill style={{ objectFit: 'contain' }} />
              {!inStock && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <Tag color="red">Out of Stock</Tag>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: 200,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <Text type="secondary">No Image</Text>
            </div>
          )}

          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              {name}
            </Title>
            <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
              {price ? formatPrice(price) : t('contactForPrice')}
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default function ProductsListPage() {
  const t = useTranslations();
  const { data, isLoading } = useGetPublicProductsQuery();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetPublicCategoriesQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Build tree data for category filter
  const categoryTreeData = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) return [];

    // Helper to build tree structure
    const buildTree = (parentId: string | null = null): DataNode[] => {
      return categoriesData
        .filter((cat) => cat.parent_id === parentId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((cat) => ({
          title: cat.name,
          value: cat.id,
          key: cat.id,
          children: buildTree(cat.id),
        }));
    };

    return buildTree();
  }, [categoriesData]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <Title level={2}>{t('navigation.products')}</Title>
        <Empty description="No products available" />
      </div>
    );
  }

  // Filter products
  let filteredProducts = data.filter((product) => product.is_active);

  // Search filter
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Category filter
  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter((product) =>
      product.categories?.some((cat) => cat.id === selectedCategory)
    );
  }

  // Price range filter
  filteredProducts = filteredProducts.filter((product) => {
    if (!product.price) return true; // Include "contact for price" products
    const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    return numPrice >= priceRange[0] && numPrice <= priceRange[1];
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (typeof a.price === 'number' ? a.price : parseFloat(a.price as string) || 0) - (typeof b.price === 'number' ? b.price : parseFloat(b.price as string) || 0);
      case 'price-desc':
        return (typeof b.price === 'number' ? b.price : parseFloat(b.price as string) || 0) - (typeof a.price === 'number' ? a.price : parseFloat(a.price as string) || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
        return (b.view_count || 0) - (a.view_count || 0);
      case 'newest':
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t('navigation.products')}
      </Title>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={[16, 16]}>
            {/* Search */}
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder={t('common.search')}
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>

            {/* Category Filter */}
            <Col xs={24} sm={12} md={8}>
              <TreeSelect
                style={{ width: '100%' }}
                placeholder={t('product.labels.categories')}
                value={selectedCategory === 'all' ? undefined : selectedCategory}
                onChange={(value) => setSelectedCategory(value || 'all')}
                treeData={[
                  { title: t('common.all'), value: 'all', key: 'all' },
                  ...categoryTreeData,
                ]}
                loading={isCategoriesLoading}
                showSearch
                treeDefaultExpandAll
                treeNodeFilterProp="title"
                allowClear
              />
            </Col>

            {/* Sort */}
            <Col xs={24} sm={12} md={8}>
              <TreeSelect
                style={{ width: '100%' }}
                value={sortBy}
                onChange={setSortBy}
                treeData={[
                  { title: t('common.sortNewest'), value: 'newest', key: 'newest' },
                  { title: t('common.sortPopular'), value: 'popular', key: 'popular' },
                  { title: t('common.sortPriceAsc'), value: 'price-asc', key: 'price-asc' },
                  { title: t('common.sortPriceDesc'), value: 'price-desc', key: 'price-desc' },
                  { title: t('common.sortName'), value: 'name', key: 'name' },
                ]}
              />
            </Col>
          </Row>

          {/* Price Range */}
          <div>
            <Text strong>Price Range:</Text>
            <Slider
              range
              min={0}
              max={100000000}
              step={1000000}
              value={priceRange}
              onChange={(value) => setPriceRange(value as [number, number])}
              tooltip={{
                formatter: (value) =>
                  value
                    ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(value)
                    : '',
              }}
            />
          </div>

          {/* Results count */}
          <Text type="secondary">
            {filteredProducts.length} {t('common.results')}
          </Text>
        </Space>
      </Card>

      {/* Products Grid */}
      {paginatedProducts.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {paginatedProducts.map((product) => {
              const firstImage = product.media?.find((m) => m.media_type === 'image');
              return (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={firstImage?.file_url}
                    inStock={product.in_stock}
                  />
                </Col>
              );
            })}
          </Row>

          {/* Pagination */}
          {filteredProducts.length > pageSize && (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredProducts.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              />
            </div>
          )}
        </>
      ) : (
        <Empty description="No products found" />
      )}
    </div>
  );
}
