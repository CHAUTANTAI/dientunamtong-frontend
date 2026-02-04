'use client';

/**
 * Category List Page
 * Shows category table with view, edit, delete actions
 */

import { useState } from 'react';
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
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useGetCategoriesQuery, useDeleteCategoryMutation, useUpdateCategoryMutation } from '@/store/api/categoryApi';
import type { Category } from '@/types/category';
import { ROUTES } from '@/constants/routes';
import { FormInput, FormSubmitButton } from '@/components/common/form';

interface CategoryFormValues {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export default function AdminCategoryPage() {
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CategoryFormValues>();

  const openDetail = (record: Category) => {
    setSelectedCategory(record);
    setIsDetailOpen(true);
  };

  const openEdit = (record: Category) => {
    setSelectedCategory(record);
    reset({
      name: record.name,
      description: record.description ?? '',
      is_active: record.is_active ?? true,
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (record: Category) => {
    try {
      await deleteCategory(record.id).unwrap();
      message.success('Category deleted successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error('Failed to delete category');
    }
  };

  const onSubmitEdit = async (values: CategoryFormValues) => {
    if (!selectedCategory) return;

    try {
      await updateCategory({
        id: selectedCategory.id,
        body: {
          name: values.name,
          description: values.description,
          is_active: values.is_active,
        },
      }).unwrap();
      message.success('Category updated successfully');
      setIsEditOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error('Failed to update category');
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value: Category['description']) => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value: Category['is_active']) =>
        value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: Category['created_at']) =>
        value ? new Date(value).toLocaleString() : '-',
      responsive: ['md'],
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
        <span style={{ fontWeight: 500 }}>Category List</span>
        <Link href={ROUTES.CATEGORY + '/create'}>
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Category
          </Button>
        </Link>
      </Space>

      <Table<Category>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={categories}
        pagination={{ pageSize: 10 }}
      />

      {/* Detail Modal */}
      <Modal
        title="Category Details"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
      >
        {selectedCategory && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selectedCategory.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedCategory.name}</Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedCategory.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedCategory.is_active ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedCategory.created_at
                ? new Date(selectedCategory.created_at).toLocaleString()
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {selectedCategory.updated_at
                ? new Date(selectedCategory.updated_at).toLocaleString()
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Category"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedCategory(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmitEdit)}>
          <FormInput
            name="name"
            control={control}
            label="Name"
            placeholder="Enter category name"
            rules={{
              required: 'Name is required',
              maxLength: {
                value: 255,
                message: 'Name must not exceed 255 characters',
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
                value: 500,
                message: 'Description must not exceed 500 characters',
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

          <FormSubmitButton
            isLoading={isSubmitting || isUpdating}
            style={{ marginTop: 8 }}
          >
            Save Changes
          </FormSubmitButton>
        </Form>
      </Modal>
    </>
  );
}

