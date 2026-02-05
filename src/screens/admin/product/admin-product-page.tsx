'use client';

/**
 * Product List Page
 * Shows product table with view, edit, delete actions
 */

import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Modal,
  Form,
  Switch,
  Descriptions,
  message,
  Image,
  Upload,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  useGetProductsQuery,
  useGetProductQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useAddProductImageMutation,
  useRemoveProductImageMutation,
} from '@/store/api/productApi';
import type { Product, ProductWithImages, ProductImage } from '@/types/product';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';
import { ProductImage as ProductImageComponent } from '@/components/common/ProductImage';
import { EntityFormSkeleton } from '@/components/common/EntityFormSkeleton';
import { supabase } from '@/utils/supabase';

interface ProductFormValues {
  name: string;
  price?: string;
  short_description?: string | null;
  description?: string | null;
  is_active?: boolean;
}

const formatPrice = (price: Product['price']) => {
  if (price === null || price === undefined || price === '') return '-';
  const value = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(value)) return String(price);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const parsePrice = (price?: string) => {
  if (!price) return null;
  const normalized = price.replace(/,/g, '');
  const value = Number(normalized);
  if (Number.isNaN(value)) return null;
  return value;
};

export default function AdminProductPage() {
  const { data: products, isLoading, refetch } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [addProductImage, { isLoading: isAddingImage }] = useAddProductImageMutation();
  const [removeProductImage, { isLoading: isRemovingImage }] = useRemoveProductImageMutation();

  const [selectedProduct, setSelectedProduct] = useState<ProductWithImages | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Get primary image (sort_order = 0) or first image
  const getPrimaryImage = (images?: ProductImage[]) => {
    if (!images || images.length === 0) return null;
    const primaryImage = images.find((img) => img.sort_order === 0);
    return primaryImage || images[0];
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProductFormValues>();

  const {
    data: editingProduct,
    isLoading: isLoadingEditingProduct,
  } = useGetProductQuery(editingProductId as string, {
    skip: !editingProductId,
  });

  useEffect(() => {
    if (!editingProduct) return;

    reset({
      name: editingProduct.name,
      price:
        editingProduct.price === null || editingProduct.price === undefined
          ? ''
          : String(editingProduct.price),
      short_description: editingProduct.short_description ?? '',
      description: editingProduct.description ?? '',
      is_active: editingProduct.is_active ?? true,
    });

    setSelectedProduct(editingProduct);
  }, [editingProduct, reset]);

  const openDetail = (record: ProductWithImages) => {
    setSelectedProduct(record);
    setIsDetailOpen(true);
  };

  const openEdit = (record: ProductWithImages) => {
    setEditingProductId(record.id);
    setEditFileList([]); // Reset file list when opening edit modal
    setIsEditOpen(true);
  };

  const handleDelete = async (record: ProductWithImages) => {
    try {
      await deleteProduct(record.id).unwrap();
      message.success('Product deleted successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error('Failed to delete product');
    }
  };

  const onSubmitEdit = async (values: ProductFormValues) => {
    if (!selectedProduct) return;

    try {
      const numericPrice = parsePrice(values.price);

      // Step 1: Update product info
      await updateProduct({
        id: selectedProduct.id,
        body: {
          name: values.name,
          price: numericPrice,
          short_description: values.short_description,
          description: values.description,
          is_active: values.is_active,
        },
      }).unwrap();

      // Step 2: Handle image upload if new file is provided
      if (editFileList.length > 0 && editFileList[0].originFileObj) {
        const file = editFileList[0].originFileObj;
        const fileName = `${selectedProduct.id}_${file.name}`;
        const filePath = `product/${fileName}`;

        // Delete old primary image if exists
        const primaryImage = getPrimaryImage(selectedProduct.images);
        if (primaryImage) {
          try {
            await removeProductImage({
              imageId: primaryImage.id,
            }).unwrap();
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Failed to remove old image:', error);
            // Continue with upload even if delete fails
          }
        }

        // Upload new image to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          // eslint-disable-next-line no-console
          console.error('Upload error:', uploadError);
          message.error('Failed to upload image');
          return;
        }

        // Add new product image record
        const imageUrl = `/product/${fileName}`;
        await addProductImage({
          productId: selectedProduct.id,
          image_url: imageUrl,
          sort_order: 0,
        }).unwrap();
      }

      message.success('Product updated successfully');
      setIsEditOpen(false);
      setSelectedProduct(null);
      setEditFileList([]);
      setEditingProductId(null);

      // Reload product list to ensure latest data is shown
      refetch();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error('Failed to update product');
    }
  };

  const handleEditFileChange = (info: { fileList: UploadFile[] }) => {
    setEditFileList(info.fileList.slice(-1)); // Only keep the last file
  };

  const beforeUpload = () => {
    return false; // Prevent auto upload
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: Product['price']) => formatPrice(value),
    },
    {
      title: 'Short Description',
      dataIndex: 'short_description',
      key: 'short_description',
      ellipsis: true,
      render: (value: Product['short_description']) => value || '-',
      responsive: ['md'],
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value: Product['is_active']) =>
        value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: Product['created_at']) =>
        value ? new Date(value).toLocaleString() : '-',
      responsive: ['lg'],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => openDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={isDeleting}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
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
        <span style={{ fontWeight: 500 }}>Product List</span>
        <Link href={ROUTES.PRODUCT + '/create'}>
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Product
          </Button>
        </Link>
      </Space>

      <Table<ProductWithImages>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={products}
        pagination={{ pageSize: 10 }}
      />

      {/* Detail Modal */}
      <Modal
        title="Product Details"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
      >
        {selectedProduct && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selectedProduct.id}</Descriptions.Item>
            <Descriptions.Item label="Name">
              {selectedProduct.name}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              {formatPrice(selectedProduct.price)}
            </Descriptions.Item>
            <Descriptions.Item label="Short Description">
              {selectedProduct.short_description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedProduct.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedProduct.is_active ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedProduct.created_at
                ? new Date(selectedProduct.created_at).toLocaleString()
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {selectedProduct.updated_at
                ? new Date(selectedProduct.updated_at).toLocaleString()
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Image">
              {(() => {
                const primaryImage = getPrimaryImage(selectedProduct.images);
                return primaryImage ? (
                  <ProductImageComponent
                    imageUrl={primaryImage.image_url}
                    alt={selectedProduct.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  '-'
                );
              })()}
            </Descriptions.Item>
            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <Descriptions.Item label="All Images">
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedProduct.images.map((img) => (
                      <ProductImageComponent
                        key={img.id}
                        imageUrl={img.image_url}
                        alt={selectedProduct.name}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Product"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedProduct(null);
          setEditingProductId(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmitEdit)}
        >
          {isLoadingEditingProduct || !selectedProduct ? (
            <EntityFormSkeleton fieldCount={4} showImage showActions />
          ) : (
            <>
              <FormInput
                name="name"
                control={control}
                label="Name"
                placeholder="Enter product name"
                rules={{
                  required: 'Name is required',
                  maxLength: {
                    value: 255,
                    message: 'Name must not exceed 255 characters',
                  },
                }}
              />

              <FormInput
                name="price"
                control={control}
                label="Price"
                placeholder="Enter price (optional)"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const numeric = parsePrice(value);
                    if (numeric === null) {
                      return 'Price must be a valid number';
                    }
                    if (numeric < 0) {
                      return 'Price must be greater than or equal to 0';
                    }
                    return true;
                  },
                }}
              />

              <FormInput
                name="short_description"
                control={control}
                label="Short Description"
                placeholder="Enter short description (optional)"
                textarea
                rules={{
                  maxLength: {
                    value: 255,
                    message: 'Short description must not exceed 255 characters',
                  },
                }}
              />

              <FormInput
                name="description"
                control={control}
                label="Description"
                placeholder="Enter description (optional)"
                textarea
                rules={{
                  maxLength: {
                    value: 1000,
                    message: 'Description must not exceed 1000 characters',
                  },
                }}
              />

              <Form.Item label="Active">
                <Switch
                  checked={!!control._formValues.is_active}
                  onChange={(checked) =>
                    control._formValues &&
                    // eslint-disable-next-line no-param-reassign
                    (control._formValues.is_active = checked)
                  }
                />
              </Form.Item>

              {(() => {
                const primaryImage = getPrimaryImage(selectedProduct.images);
                return primaryImage ? (
                  <Form.Item label="Current Product Image">
                    <ProductImageComponent
                      imageUrl={primaryImage.image_url}
                      alt={selectedProduct.name}
                      width={200}
                      height={200}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  </Form.Item>
                ) : null;
              })()}

              <Form.Item label="Upload New Image (Optional)">
                <Upload
                  fileList={editFileList}
                  onChange={handleEditFileChange}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Select New Image</Button>
                </Upload>
                <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
                  {editFileList.length > 0
                    ? 'New image will replace the current image'
                    : 'Select a new image to replace the current one (optional)'}
                </div>
              </Form.Item>

              <FormSubmitButton
                isLoading={isSubmitting || isUpdating || isAddingImage || isRemovingImage}
                style={{ marginTop: 8 }}
              >
                Save Changes
              </FormSubmitButton>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}

