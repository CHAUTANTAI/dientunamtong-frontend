'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  Empty,
  Breadcrumb,
  Select,
  Space,
  Pagination,
  Tag,
  Input,
  TreeSelect,
} from 'antd';
import { HomeOutlined, SearchOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useGetPublicCategoriesQuery, useGetPublicCategoryByIdQuery } from '@/store/services/publicCategoryApi';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { useViewTracker } from '@/hooks/useViewTracker';
import { ROUTES } from '@/constants/routes';

const { Title, Text, Paragraph } = Typography;

interface CategoryDetailPageProps {
  categoryId: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number | null;
  imageUrl?: string;
  inStock: boolean;
}

const ProductCard = ({ id, name, price, imageUrl, inStock }: ProductCardProps) => {
  const t = useTranslations('product.labels');
  const signedUrl = useSignedImageUrl(imageUrl || '');
  const { trackView } = useViewTracker();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

export default function CategoryDetailPage({ categoryId }: CategoryDetailPageProps) {
  const t = useTranslations();
  const { data: category, isLoading: categoryLoading, error } = useGetPublicCategoryByIdQuery(categoryId);
  const { data: allCategories = [], isLoading: categoriesLoading } = useGetPublicCategoriesQuery();
  const { data: allProductsData, isLoading: productsLoading } = useGetPublicProductsQuery();
  const { trackView } = useViewTracker();

  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>(undefined);
  const pageSize = 12;

  useEffect(() => {
    if (category) {
      trackView(categoryId, 'category');
    }
  }, [category, categoryId, trackView]);

  // Get all descendant category IDs (including current category)
  const descendantCategoryIds = useMemo(() => {
    if (!allCategories.length) return [categoryId];

    const getAllDescendants = (catId: string): string[] => {
      const children = allCategories.filter(cat => cat.parent_id === catId);
      const childIds = children.map(c => c.id);
      const grandChildIds = children.flatMap(c => getAllDescendants(c.id));
      return [...childIds, ...grandChildIds];
    };

    return [categoryId, ...getAllDescendants(categoryId)];
  }, [allCategories, categoryId]);

  // Build subcategory tree starting from current category
  const subCategoryTree = useMemo(() => {
    if (!allCategories.length) return [];

    interface TreeNode {
      value: string;
      title: string;
      children?: TreeNode[];
    }

    const buildTree = (parentId: string | null): TreeNode[] => {
      return allCategories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          value: cat.id,
          title: cat.name,
          children: buildTree(cat.id),
        }));
    };

    return buildTree(categoryId);
  }, [allCategories, categoryId]);

  // Get all descendant category IDs for selected subcategory
  const selectedDescendantIds = useMemo(() => {
    if (!selectedSubCategory || !allCategories.length) return [];

    const getAllDescendants = (catId: string): string[] => {
      const children = allCategories.filter(cat => cat.parent_id === catId);
      const childIds = children.map(c => c.id);
      const grandChildIds = children.flatMap(c => getAllDescendants(c.id));
      return [...childIds, ...grandChildIds];
    };

    return [selectedSubCategory, ...getAllDescendants(selectedSubCategory)];
  }, [selectedSubCategory, allCategories]);

  if (categoryLoading || productsLoading || categoriesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div>
        <Empty description="Category not found" />
      </div>
    );
  }

  // Filter products by descendant categories
  let categoryProducts =
    allProductsData?.products.filter(
      (product) =>
        product.is_active &&
        product.categories?.some((cat) => descendantCategoryIds.includes(cat.id))
    ) || [];

  // Further filter by selected subcategory if any
  if (selectedSubCategory && selectedDescendantIds.length > 0) {
    categoryProducts = categoryProducts.filter(product =>
      product.categories?.some(cat => selectedDescendantIds.includes(cat.id))
    );
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    categoryProducts = categoryProducts.filter(product =>
      product.name.toLowerCase().includes(query)
    );
  }

  // Sort products
  categoryProducts = [...categoryProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
        return b.view_count - a.view_count;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = categoryProducts.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            href: ROUTES.HOME,
            title: (
              <>
                <HomeOutlined />
                <span>{t('navigation.home')}</span>
              </>
            ),
          },
          {
            href: ROUTES.CATEGORIES,
            title: t('navigation.categories'),
          },
          {
            title: category.name,
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Category Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          {/* Category Image */}
          {category.media?.file_url && (
            <Col xs={24} md={8}>
              <CategoryImage imageUrl={category.media.file_url} alt={category.name} />
            </Col>
          )}

          {/* Category Info */}
          <Col xs={24} md={category.media?.file_url ? 16 : 24}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {category.name}
                </Title>
                {category.slug && <Text type="secondary">/{category.slug}</Text>}
              </div>

              {category.description && (
                <Paragraph style={{ fontSize: 16 }}>{category.description}</Paragraph>
              )}

              <Space>
                <Text strong>Total Products:</Text>
                <Text>{categoryProducts.length}</Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Sort and Filter Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Search and Category Filter Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                placeholder={t('common.search')}
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                allowClear
                size="large"
              />
            </Col>
            {subCategoryTree.length > 0 && (
              <Col xs={24} md={12}>
                <TreeSelect
                  style={{ width: '100%' }}
                  placeholder="Filter by subcategory"
                  treeData={subCategoryTree}
                  value={selectedSubCategory}
                  onChange={(value) => {
                    setSelectedSubCategory(value);
                    setCurrentPage(1); // Reset to first page
                  }}
                  allowClear
                  size="large"
                  treeDefaultExpandAll
                />
              </Col>
            )}
          </Row>

          {/* Results and Sort Row */}
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col>
              <Text strong>
                {categoryProducts.length} {t('common.results')}
              </Text>
            </Col>
            <Col>
              <Space>
                <Text>Sort by:</Text>
                <Select style={{ width: 200 }} value={sortBy} onChange={setSortBy}>
                  <Select.Option value="newest">{t('common.sortNewest')}</Select.Option>
                  <Select.Option value="popular">{t('common.sortPopular')}</Select.Option>
                  <Select.Option value="price-asc">{t('common.sortPriceAsc')}</Select.Option>
                  <Select.Option value="price-desc">{t('common.sortPriceDesc')}</Select.Option>
                  <Select.Option value="name">{t('common.sortName')}</Select.Option>
                </Select>
              </Space>
            </Col>
          </Row>
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
          {categoryProducts.length > pageSize && (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={categoryProducts.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              />
            </div>
          )}
        </>
      ) : (
        <Empty description="No products in this category" />
      )}
    </div>
  );
}

// Helper component to handle signed URL for category image
function CategoryImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const signedUrl = useSignedImageUrl(imageUrl);

  if (!signedUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: 8,
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Image src={signedUrl} alt={alt} fill style={{ objectFit: 'contain' }} />
    </div>
  );
}
