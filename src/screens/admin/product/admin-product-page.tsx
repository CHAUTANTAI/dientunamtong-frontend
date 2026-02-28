'use client';

/**
 * Product List Page - Simple Version
 * Display products with name + actions only
 */

import { useState, useMemo } from 'react';
import { Table, Button, Space, Modal, Tag, App, Input, Card, Descriptions, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useGetProductsQuery,
  useDeleteProductPermanentMutation,
} from '@/store/api/productApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/utils/error';
import { CategoryMultiSelect } from '@/components/common/CategoryMultiSelect';
import { ProductImage } from '@/components/common/ProductImage';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

const { Paragraph } = Typography;

/**
 * Component to display video with signed URL
 */
const VideoPreview = ({ 
  fileUrl, 
  width, 
  height, 
  autoPlay = false 
}: { 
  fileUrl: string; 
  width: number; 
  height: number;
  autoPlay?: boolean;
}) => {
  const signedUrl = useSignedImageUrl(fileUrl);
  
  if (!signedUrl) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#f0f0f0', 
          borderRadius: 4 
        }}
      >
        Loading...
      </div>
    );
  }
  
  return (
    <video
      src={signedUrl}
      controls
      autoPlay={autoPlay}
      muted={autoPlay}
      loop={autoPlay}
      style={{ width, height, objectFit: 'cover', borderRadius: 4 }}
    />
  );
};

/**
 * Build category breadcrumb path (Parent > Child > ...)
 */
const buildCategoryPath = (category: Category, allCategories: Category[]): string => {
  const path: string[] = [];
  let current: Category | undefined = category;
  
  while (current) {
    path.unshift(current.name);
    current = allCategories.find(c => c.id === current?.parent_id);
  }
  
  return path.join(' > ');
};

export default function AdminProductPage() {
  const t = useTranslations();
  const router = useRouter();
  const { message } = App.useApp();
  const { data: productsData = [], isLoading } = useGetProductsQuery();
  const { data: allCategories = [] } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductPermanentMutation();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Filter states - Input states (temporary)
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategoryInput, setSelectedCategoryInput] = useState<string[]>([]);
  
  // Filter states - Applied states (used for actual filtering)
  const [appliedSearchText, setAppliedSearchText] = useState('');
  const [appliedCategoryIds, setAppliedCategoryIds] = useState<string[]>([]);

  /**
   * Clear search filter
   */
  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearchText('');
  };

  /**
   * Clear category filter
   */
  const handleClearCategory = () => {
    setSelectedCategoryInput([]);
    setAppliedCategoryIds([]);
  };

  /**
   * Apply search filter
   */
  const handleSearch = () => {
    setAppliedSearchText(searchInput);
  };

  /**
   * Apply category filter
   */
  const handleFilter = () => {
    setAppliedCategoryIds(selectedCategoryInput);
  };

  /**
   * Clear all filters
   */
  const handleClearAllFilters = () => {
    setSearchInput('');
    setSelectedCategoryInput([]);
    setAppliedSearchText('');
    setAppliedCategoryIds([]);
  };

  /**
   * Filter products by applied search text and selected categories
   */
  const filteredProducts = useMemo(() => {
    let filtered = productsData;

    // Filter by search text (name)
    if (appliedSearchText.trim()) {
      const searchLower = appliedSearchText.toLowerCase().trim();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected categories
    if (appliedCategoryIds.length > 0) {
      filtered = filtered.filter((product) => {
        const productCategoryIds = product.categories?.map((cat) => cat.id) || [];
        return appliedCategoryIds.some((selectedId) =>
          productCategoryIds.includes(selectedId)
        );
      });
    }

    return filtered;
  }, [productsData, appliedSearchText, appliedCategoryIds]);

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  /**
   * Confirm delete
   */
  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id).unwrap();
      message.success(`Product "${selectedProduct.name}" ${t('product.messages.deleteSuccess')}`);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Delete error:', error);
      message.error(getErrorMessage(error, t('product.messages.deleteFailed')));
    }
  };

  /**
   * Open detail modal
   */
  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  /**
   * Navigate to edit
   */
  const handleEdit = (product: Product) => {
    router.push(`${ROUTES.PRODUCT}/${product.id}/edit`);
  };

  const columns: ColumnsType<Product> = [
    {
      title: t('product.labels.name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <Space direction="vertical" size={0}>
          <strong>{name}</strong>
          {record.sku && <span style={{ fontSize: 12, color: '#999' }}>SKU: {record.sku}</span>}
        </Space>
      ),
    },
    {
      title: t('product.labels.price'),
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: Product['price']) => {
        if (!price) return '-';
        const numPrice = typeof price === 'string' ? Number(price) : price;
        return numPrice.toLocaleString('vi-VN') + ' đ';
      },
    },
    {
      title: t('product.labels.status'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (isActive: boolean) =>
        isActive ? <Tag color="green">{t('common.active')}</Tag> : <Tag color="red">{t('common.inactive')}</Tag>,
    },
    {
      title: t('product.labels.stock'),
      dataIndex: 'in_stock',
      key: 'in_stock',
      width: 100,
      align: 'center',
      render: (inStock: boolean) =>
        inStock ? <Tag color="blue">{t('common.inStock')}</Tag> : <Tag color="red">{t('common.outOfStock')}</Tag>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record: Product) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title={t('common.view')}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            loading={isDeleting && selectedProduct?.id === record.id}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space
        style={{
          width: '100%',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <h2 style={{ margin: 0 }}>{t('navigation.products')}</h2>
        <Link href={`${ROUTES.PRODUCT}/create`}>
          <Button type="primary" icon={<PlusOutlined />}>
            {t('product.actions.create')}
          </Button>
        </Link>
      </Space>

      {/* Filter Section */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              {t('product.search.searchByName')}
            </label>
            <Space.Compact style={{ width: '100%', maxWidth: '100%', display: 'flex' }}>
              <Input
                placeholder={t('product.search.searchPlaceholder')}
                prefix={<SearchOutlined />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
                style={{ flex: 1, minWidth: 0 }}
              />
              <Button type="primary" onClick={handleSearch}>
                {t('product.actions.search')}
              </Button>
              <Button onClick={handleClearSearch}>
                {t('product.actions.clear')}
              </Button>
            </Space.Compact>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              {t('product.search.filterByCategory')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <CategoryMultiSelect
                value={selectedCategoryInput}
                onChange={(value) => setSelectedCategoryInput(value as string[])}
                placeholder={t('product.search.categoryPlaceholder')}
                style={{ width: '100%', minWidth: 300 }}
                popupMatchSelectWidth={false}
              />
              <Space>
                <Button type="primary" onClick={handleFilter}>
                  {t('product.actions.filter')}
                </Button>
                <Button onClick={handleClearCategory}>
                  {t('product.actions.clear')}
                </Button>
              </Space>
            </div>
          </div>
          {(appliedSearchText || appliedCategoryIds.length > 0) && (
            <div>
              <Button
                size="small"
                onClick={handleClearAllFilters}
              >
                {t('product.actions.clearAllFilters')}
              </Button>
              <span style={{ marginLeft: 8, color: '#666' }}>
                {t('product.search.showingResults', { 
                  filtered: filteredProducts.length, 
                  total: productsData.length 
                })}
              </span>
            </div>
          )}
        </Space>
      </Card>

      <div style={{ overflowX: 'auto' }}>
        <Table<Product>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={filteredProducts}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => t('product.search.totalProducts', { count: total }),
          }}
        />
      </div>

      {/* Product Detail Modal */}
      <Modal
        title={<span style={{ fontWeight: 600 }}>📦 {t('product.detail.title')}</span>}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            {t('common.close')}
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              if (selectedProduct) {
                setIsDetailModalOpen(false);
                handleEdit(selectedProduct);
              }
            }}
          >
            {t('product.actions.edit')}
          </Button>,
        ]}
        width={800}
      >
        {selectedProduct && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Basic Information */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label={t('product.labels.name')} span={2}>
                <strong>{selectedProduct.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label={t('product.labels.sku')}>
                {selectedProduct.sku || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.labels.slug')}>
                {selectedProduct.slug}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.labels.price')} span={2}>
                {selectedProduct.price
                  ? `${Number(selectedProduct.price).toLocaleString('vi-VN')} đ`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.labels.status')}>
                {selectedProduct.is_active ? (
                  <Tag color="green">{t('common.active')}</Tag>
                ) : (
                  <Tag color="red">{t('common.inactive')}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.labels.stock')}>
                {selectedProduct.in_stock ? (
                  <Tag color="blue">{t('common.inStock')}</Tag>
                ) : (
                  <Tag color="red">{t('common.outOfStock')}</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Categories */}
            {selectedProduct.categories && selectedProduct.categories.length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>{t('product.labels.categories')}:</strong>
                <Space wrap>
                  {selectedProduct.categories.map((cat) => (
                    <Tag key={cat.id} color="blue">
                      {buildCategoryPath(cat, allCategories)}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* Short Description */}
            {selectedProduct.short_description && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>{t('product.labels.shortDescription')}:</strong>
                <Paragraph style={{ marginBottom: 0 }}>
                  {selectedProduct.short_description}
                </Paragraph>
              </div>
            )}

            {/* Description */}
            {selectedProduct.description && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>{t('product.labels.description')}:</strong>
                <Paragraph style={{ marginBottom: 0 }}>
                  {selectedProduct.description}
                </Paragraph>
              </div>
            )}

            {/* Specifications */}
            {selectedProduct.specifications &&
              Object.keys(selectedProduct.specifications).length > 0 && (
                <div>
                  <strong style={{ display: 'block', marginBottom: 8 }}>{t('product.labels.specifications')}:</strong>
                  <Descriptions bordered column={1} size="small">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key}>
                        {value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </div>
              )}

            {/* Tags */}
            {selectedProduct.tags && selectedProduct.tags.length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>{t('product.labels.tags')}:</strong>
                <Space wrap>
                  {selectedProduct.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* Media - Images */}
            {selectedProduct.media && selectedProduct.media.filter(m => m.media_type === 'image').length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>{t('product.labels.images')}:</strong>
                <Space wrap size="middle">
                  {selectedProduct.media
                    .filter(m => m.media_type === 'image')
                    .map((media) => (
                      <ProductImage
                        key={media.id}
                        imageUrl={media.file_url}
                        alt={media.alt_text || selectedProduct.name}
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                </Space>
              </div>
            )}

            {/* Media - Videos */}
            {selectedProduct.media && selectedProduct.media.filter(m => m.media_type === 'video').length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>{t('product.labels.video')}:</strong>
                <Space wrap size="middle">
                  {selectedProduct.media
                    .filter(m => m.media_type === 'video')
                    .map((media) => (
                      <VideoPreview
                        key={media.id}
                        fileUrl={media.file_url}
                        width={400}
                        height={225}
                        autoPlay={true}
                      />
                    ))}
                </Space>
              </div>
            )}
          </Space>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <span style={{ color: '#ff4d4f', fontWeight: 600 }}>⚠️ {t('product.actions.delete')}</span>
        }
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        okText={t('product.actions.deletePermanently')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true, loading: isDeleting }}
        cancelButtonProps={{ disabled: isDeleting }}
      >
        <p>
          {t('product.messages.confirmDelete', { name: selectedProduct?.name || '' })}
        </p>
        <p style={{ color: '#ff4d4f', marginBottom: 0 }}>
          ⚠️ {t('product.messages.deleteWarning')}
        </p>
      </Modal>
    </>
  );
}
