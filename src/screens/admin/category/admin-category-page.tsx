'use client';

/**
 * Category List Page
 * Shows category tree with expand/collapse and inline actions
 */

import { useState, useMemo } from 'react';
import { Button, Space, App, Modal, Descriptions, Input, Select, Card, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetCategoriesQuery, useDeleteCategoryPermanentMutation } from '@/store/api/categoryApi';
import type { Category } from '@/types/category';
import { ROUTES } from '@/constants/routes';
import { getErrorMessage } from '@/utils/error';
import { ProductImage } from '@/components/common/ProductImage';
import { CategoryTreeTable } from '@/components/common/CategoryTreeTable';
import { useAuth } from '@/hooks/useAuth';
import { getPermissions } from '@/utils/rbac';

export default function AdminCategoryPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const permissions = getPermissions(user?.role || null);
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [deleteCategoryPermanent, { isLoading: isDeleting }] = useDeleteCategoryPermanentMutation();

  // Use App hooks for message only
  const { message } = App.useApp();

  // Debug logs
  console.log('[AdminCategoryPage] User:', user);
  console.log('[AdminCategoryPage] Permissions:', permissions);
  console.log('[AdminCategoryPage] canDeleteCategory:', permissions.canDeleteCategory);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);

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

    // Sort by level and name (alphabet)
    return filtered.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
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
    console.log('[handleDelete] Called with category:', record);
    console.log('[handleDelete] User role:', user?.role);
    console.log('[handleDelete] Permissions:', permissions);

    // Count children of this category
    const children = categories.filter((cat) => cat.parent_id === record.id);
    const childCount = children.length;

    console.log('[handleDelete] Children count:', childCount);
    console.log('[handleDelete] Opening delete modal...');

    setCategoryToDelete(record);
    setChildrenCount(childCount);
    setIsDeleteModalOpen(true);
  };

  /**
   * Confirm delete action
   */
  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    const hasCascade = childrenCount > 0;
    console.log('[confirmDelete] Starting delete for:', categoryToDelete);
    console.log('[confirmDelete] Has children:', hasCascade);
    console.log('[confirmDelete] Cascade:', hasCascade);

    try {
      console.log(
        '[confirmDelete] Calling deleteCategoryPermanent API with ID:',
        categoryToDelete.id
      );
      await deleteCategoryPermanent({
        id: categoryToDelete.id,
        cascade: hasCascade,
      }).unwrap();

      console.log('[confirmDelete] Delete success');
      message.success(
        hasCascade
          ? `${t('category.messages.deleteSuccess', { name: categoryToDelete.name })} ${t('category.messages.deleteSuccessWithChildren', { count: childrenCount })}`
          : `${categoryToDelete.name} ${t('category.messages.deleteSuccess')}`
      );
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setChildrenCount(0);
    } catch (error) {
      console.error('[confirmDelete] Delete error:', error);
      message.error(getErrorMessage(error, t('category.messages.deleteError')));
    }
  };

  /**
   * Cancel delete action
   */
  const cancelDelete = () => {
    console.log('[cancelDelete] Delete cancelled');
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
    setChildrenCount(0);
  };

  /**
   * Navigate to create page with parent_id
   */
  const handleAddChild = (parentCategory: Category) => {
    router.push(`${ROUTES.CATEGORY}/create?parent_id=${parentCategory.id}`);
  };

  return (
    <>
      {/* Header with filters and actions */}
      <Card>
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
          <Space wrap style={{ flex: 1, minWidth: 0 }}>
            <Input
              placeholder={t('category.search.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%', maxWidth: 250, minWidth: 150 }}
              allowClear
            />
            <Select
              value={filterActive}
              onChange={setFilterActive}
              style={{ width: 120 }}
              options={[
                { label: t('common.all'), value: 'all' },
                { label: t('common.active'), value: 'active' },
                { label: t('common.inactive'), value: 'inactive' },
              ]}
            />
          </Space>
          <Link href={`${ROUTES.CATEGORY}/create`}>
            <Button type="primary" icon={<PlusOutlined />}>
              {t('category.addRootCategory')}
            </Button>
          </Link>
        </Space>

        {/* Category Tree Table with horizontal scroll */}
        <div style={{ overflowX: 'auto' }}>
          <CategoryTreeTable
            categories={filteredCategories}
            isLoading={isLoading}
            onView={openDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            isDeleting={isDeleting}
            canDelete={permissions.canDeleteCategory}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={t('category.detail.title')}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        afterClose={() => setSelectedCategory(null)}
        footer={null}
        width={600}
        key={selectedCategory?.id}
      >
        {selectedCategory && (
          <>
            {selectedCategory.media?.file_url && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <ProductImage
                  imageUrl={selectedCategory.media.file_url}
                  alt={selectedCategory.name}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            )}
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t('category.detail.id')}>{selectedCategory.id}</Descriptions.Item>
              <Descriptions.Item label={t('category.detail.name')}>{selectedCategory.name}</Descriptions.Item>
              <Descriptions.Item label={t('category.detail.slug')}>
                <code>{selectedCategory.slug}</code>
              </Descriptions.Item>
              <Descriptions.Item label={t('category.detail.description')}>
                {selectedCategory.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('category.detail.parent')}>
                {selectedCategory.parent?.name || <Tag color="blue">{t('common.root')}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label={t('category.detail.level')}>
                <Tag>{selectedCategory.level}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('category.detail.sortOrder')}>
                {selectedCategory.sort_order}
              </Descriptions.Item>
              <Descriptions.Item label={t('category.detail.status')}>
                {selectedCategory.is_active ? (
                  <Tag color="green">{t('common.active')}</Tag>
                ) : (
                  <Tag color="red">{t('common.inactive')}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('category.detail.createdAt')}>
                {new Date(selectedCategory.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label={t('category.detail.updatedAt')}>
                {new Date(selectedCategory.updated_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={<span style={{ color: '#ff4d4f', fontWeight: 600 }}>⚠️ {t('category.delete')}</span>}
        open={isDeleteModalOpen}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText={t('category.messages.deletePermanently')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true, loading: isDeleting }}
        cancelButtonProps={{ disabled: isDeleting }}
      >
        {childrenCount > 0 ? (
          <div>
            <p style={{ marginBottom: 12 }}>
              <strong>{t('category.messages.deleteWithChildrenWarning', { count: childrenCount })}</strong>
            </p>
            <p style={{ marginBottom: 12 }}>
              {t('category.messages.deleteWithChildrenMessage', { name: categoryToDelete?.name || '' })}
            </p>
            <p style={{ marginBottom: 0, color: '#ff4d4f' }}>
              {t('category.messages.deleteWarning')}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: 12 }}>
              {t('category.messages.deleteConfirm', { name: categoryToDelete?.name || '' })}
            </p>
            <p style={{ marginBottom: 0, color: '#ff4d4f' }}>
              {t('category.messages.deleteWarning')}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
