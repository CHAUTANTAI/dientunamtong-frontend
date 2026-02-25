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
import {
  useGetProductsQuery,
  useDeleteProductPermanentMutation,
} from '@/store/api/productApi';
import type { Product } from '@/types/product';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/utils/error';
import { CategoryMultiSelect } from '@/components/common/CategoryMultiSelect';
import { ProductImage } from '@/components/common/ProductImage';

const { Paragraph } = Typography;

export default function AdminProductPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { data: productsData = [], isLoading } = useGetProductsQuery();
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
      message.success(`Product "${selectedProduct.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Delete error:', error);
      message.error(getErrorMessage(error, 'Failed to delete product'));
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
      title: 'Product Name',
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
      title: 'Price',
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
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (isActive: boolean) =>
        isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Stock',
      dataIndex: 'in_stock',
      key: 'in_stock',
      width: 100,
      align: 'center',
      render: (inStock: boolean) =>
        inStock ? <Tag color="blue">In Stock</Tag> : <Tag color="red">Out of Stock</Tag>,
    },
    {
      title: 'Actions',
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
            title="View"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            loading={isDeleting && selectedProduct?.id === record.id}
            title="Delete"
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
        <h2 style={{ margin: 0 }}>Products</h2>
        <Link href={`${ROUTES.PRODUCT}/create`}>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Product
          </Button>
        </Link>
      </Space>

      {/* Filter Section */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Search by Name
            </label>
            <Space.Compact style={{ width: '100%', maxWidth: 400 }}>
              <Input
                placeholder="Enter product name..."
                prefix={<SearchOutlined />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
              <Button onClick={handleClearSearch}>
                Clear
              </Button>
            </Space.Compact>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Filter by Category
            </label>
            <Space direction="horizontal" style={{ width: '100%', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 600 }}>
                <CategoryMultiSelect
                  value={selectedCategoryInput}
                  onChange={(value) => setSelectedCategoryInput(value as string[])}
                  placeholder="Select categories..."
                  style={{ width: '100%' }}
                  popupMatchSelectWidth={false}
                  styles={{ 
                    popup: {
                      root: {
                        minWidth: 600,
                        maxWidth: '90vw', 
                        overflowX: 'auto'
                      }
                    }
                  }}
                />
              </div>
              <Button type="primary" onClick={handleFilter}>
                Filter
              </Button>
              <Button onClick={handleClearCategory}>
                Clear
              </Button>
            </Space>
          </div>
          {(appliedSearchText || appliedCategoryIds.length > 0) && (
            <div>
              <Button
                size="small"
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </Button>
              <span style={{ marginLeft: 8, color: '#666' }}>
                Showing {filteredProducts.length} of {productsData.length} products
              </span>
            </div>
          )}
        </Space>
      </Card>

      <Table<Product>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={filteredProducts}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`,
        }}
      />

      {/* Product Detail Modal */}
      <Modal
        title={<span style={{ fontWeight: 600 }}>📦 Product Details</span>}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
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
            Edit Product
          </Button>,
        ]}
        width={800}
      >
        {selectedProduct && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Basic Information */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Product Name" span={2}>
                <strong>{selectedProduct.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="SKU">
                {selectedProduct.sku || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Price">
                {selectedProduct.price
                  ? `${Number(selectedProduct.price).toLocaleString('vi-VN')} đ`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedProduct.is_active ? (
                  <Tag color="green">Active</Tag>
                ) : (
                  <Tag color="red">Inactive</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Stock">
                {selectedProduct.in_stock ? (
                  <Tag color="blue">In Stock</Tag>
                ) : (
                  <Tag color="red">Out of Stock</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Categories */}
            {selectedProduct.categories && selectedProduct.categories.length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>Categories:</strong>
                <Space wrap>
                  {selectedProduct.categories.map((cat) => (
                    <Tag key={cat.id} color="blue">
                      {cat.name}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* Short Description */}
            {selectedProduct.short_description && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>Short Description:</strong>
                <Paragraph style={{ marginBottom: 0 }}>
                  {selectedProduct.short_description}
                </Paragraph>
              </div>
            )}

            {/* Description */}
            {selectedProduct.description && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>Description:</strong>
                <Paragraph style={{ marginBottom: 0 }}>
                  {selectedProduct.description}
                </Paragraph>
              </div>
            )}

            {/* Specifications */}
            {selectedProduct.specifications &&
              Object.keys(selectedProduct.specifications).length > 0 && (
                <div>
                  <strong style={{ display: 'block', marginBottom: 8 }}>Specifications:</strong>
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
                <strong style={{ display: 'block', marginBottom: 8 }}>Tags:</strong>
                <Space wrap>
                  {selectedProduct.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* Media */}
            {selectedProduct.media && selectedProduct.media.length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: 8 }}>Media:</strong>
                <Space wrap size="middle">
                  {selectedProduct.media.map((media) => (
                    <div key={media.id}>
                      {media.media_type === 'image' ? (
                        <ProductImage
                          imageUrl={media.file_url}
                          alt={media.alt_text || selectedProduct.name}
                          width={120}
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                        />
                      ) : (
                        <video
                          src={media.file_url}
                          controls
                          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4 }}
                        />
                      )}
                    </div>
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
          <span style={{ color: '#ff4d4f', fontWeight: 600 }}>⚠️ Delete Product</span>
        }
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        okText="Delete Permanently"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: isDeleting }}
        cancelButtonProps={{ disabled: isDeleting }}
      >
        <p>
          Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
        </p>
        <p style={{ color: '#ff4d4f', marginBottom: 0 }}>
          ⚠️ This action <strong>cannot be undone</strong>. All associated media files will
          also be deleted.
        </p>
      </Modal>
    </>
  );
}
