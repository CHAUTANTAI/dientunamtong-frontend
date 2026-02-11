'use client';

/**
 * Category List Page
 * Shows category tree with image, parent info, and CRUD actions
 */

import { useState, useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Modal,
  Descriptions,
  Image,
  Input,
  Select,
  message,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '@/store/api/categoryApi';
import type { Category } from '@/types/category';
import { ROUTES } from '@/constants/routes';

export default function AdminCategoryPage() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');

  /**
   * Filter and sort categories
   */
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Filter by search text
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(search) ||
          cat.slug.toLowerCase().includes(search) ||
          cat.description?.toLowerCase().includes(search)
      );
    }

    // Filter by active status
    if (filterActive !== 'all') {
      const isActive = filterActive === 'active';
      filtered = filtered.filter((cat) => cat.is_active === isActive);
    }

    // Sort by level and sort_order
    return filtered.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  }, [categories, searchText, filterActive]);

  /**
   * Open detail modal
   */
  const openDetail = (record: Category) => {
    setSelectedCategory(record);
    setIsDetailOpen(true);
  };

  /**
   * Navigate to edit page
   */
  const handleEdit = (record: Category) => {
    router.push(`${ROUTES.CATEGORY}/${record.id}/edit`);
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = (record: Category) => {
    Modal.confirm({
      title: 'Delete Category',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteCategory(record.id).unwrap();
          message.success('Category deleted successfully');
        } catch (error: any) {
          console.error(error);
          const errorMessage = error?.data?.error || 'Failed to delete category';
          message.error(errorMessage);
        }
      },
    });
  };

  /**
   * Table columns with tree structure display
   */
  const columns: ColumnsType<Category> = [
    {
      title: 'Image',
      dataIndex: 'media',
      key: 'media',
      width: 80,
      render: (media: Category['media']) =>
        media?.file_url ? (
          <Image
            src={media.file_url}
            alt="Category"
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#999',
            }}
          >
            No image
          </div>
        ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <div style={{ paddingLeft: record.level * 20 }}>
          {record.level > 0 && '└─ '}
          <strong>{name}</strong>
        </div>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      responsive: ['md'],
      render: (slug: string) => <code>{slug}</code>,
    },
    {
      title: 'Parent',
      dataIndex: 'parent',
      key: 'parent',
      responsive: ['lg'],
      render: (parent: Category['parent']) =>
        parent ? parent.name : <Tag color="blue">Root</Tag>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      align: 'center',
      render: (level: number) => <Tag>{level}</Tag>,
    },
    {
      title: 'Sort',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      align: 'center',
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (value: boolean) =>
        value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
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
              onClick={() => handleEdit(record)}
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
      {/* Header with filters and actions */}
      <Space
        style={{
          width: '100%',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Space wrap>
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            value={filterActive}
            onChange={setFilterActive}
            style={{ width: 120 }}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </Space>
        <Link href={`${ROUTES.CATEGORY}/create`}>
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Category
          </Button>
        </Link>
      </Space>

      {/* Category Table */}
      <Table<Category>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={filteredCategories}
        pagination={{ 
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} categories`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Detail Modal */}
      <Modal
        title="Category Details"
        open={isDetailOpen}
        onCancel={() => {
          setIsDetailOpen(false);
          setSelectedCategory(null);
        }}
        footer={null}
        width={600}
      >
        {selectedCategory && (
          <>
            {selectedCategory.media?.file_url && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image
                  src={selectedCategory.media.file_url}
                  alt={selectedCategory.name}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            )}
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="ID">{selectedCategory.id}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedCategory.name}</Descriptions.Item>
              <Descriptions.Item label="Slug">
                <code>{selectedCategory.slug}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedCategory.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Parent">
                {selectedCategory.parent?.name || <Tag color="blue">Root</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Level">
                <Tag>{selectedCategory.level}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sort Order">
                {selectedCategory.sort_order}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedCategory.is_active ? (
                  <Tag color="green">Active</Tag>
                ) : (
                  <Tag color="red">Inactive</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(selectedCategory.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {new Date(selectedCategory.updated_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
}

