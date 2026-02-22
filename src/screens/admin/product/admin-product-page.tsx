'use client';

/**
 * Product List Page - Simple Version
 * Display products with name + actions only
 */

import { useState } from 'react';
import { Table, Button, Space, Modal, Tag, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useGetProductsQuery,
  useDeleteProductPermanentMutation,
} from '@/store/api/productApi';
import type { Product } from '@/types/product';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/utils/error';

export default function AdminProductPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { data: productsData = [], isLoading } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductPermanentMutation();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
   * Navigate to view details
   */
  const handleView = (product: Product) => {
    router.push(`${ROUTES.PRODUCT}/${product.id}`);
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

      <Table<Product>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={productsData}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`,
        }}
      />

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
