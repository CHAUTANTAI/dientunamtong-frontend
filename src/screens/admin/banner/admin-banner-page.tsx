'use client';

import { useState, useEffect } from 'react';
import { Table, Image, Button, Tag, Space, App, Spin, Card, InputNumber, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useGetBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} from '@/store/api/bannerApi';
import { useGetMaxBannersQuery, useUpdateMaxBannersMutation } from '@/store/api/profileApi';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import type { Banner } from '@/types/banner';
import type { ColumnsType } from 'antd/es/table';

export const AdminBannerPage = () => {
  const t = useTranslations();
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data: banners = [], isLoading } = useGetBannersQuery();
  const { data: maxBannersData } = useGetMaxBannersQuery();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [updateMaxBanners, { isLoading: isUpdatingMax }] = useUpdateMaxBannersMutation();

  const [maxBannersValue, setMaxBannersValue] = useState<number>(6);
  const [hasMaxBannersChanged, setHasMaxBannersChanged] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track pending sort_order changes
  const [pendingSortOrders, setPendingSortOrders] = useState<Map<string, number>>(new Map());
  const [localBanners, setLocalBanners] = useState<Banner[]>([]);

  // Sync localBanners with fetched banners
  useEffect(() => {
    setLocalBanners(banners);
    setPendingSortOrders(new Map()); // Clear pending changes when data refreshes
  }, [banners]);

  // Sync maxBannersValue with fetched data
  useEffect(() => {
    if (maxBannersData?.max_banners) {
      setMaxBannersValue(maxBannersData.max_banners);
    }
  }, [maxBannersData]);

  const handleMaxBannersChange = (value: number | null) => {
    if (value === null) return;
    
    setMaxBannersValue(value);
    setHasMaxBannersChanged(value !== (maxBannersData?.max_banners || 6));

    // Validate: cannot set max below current count
    if (value < banners.length) {
      setValidationError(
        t('banner.maxBannersValidationError', { 
          max: value, 
          current: banners.length 
        })
      );
    } else {
      setValidationError(null);
    }
  };

  const handleSaveMaxBanners = async () => {
    if (validationError) return;

    try {
      await updateMaxBanners({ max_banners: maxBannersValue }).unwrap();
      message.success(t('banner.messages.maxBannersUpdateSuccess'));
      setHasMaxBannersChanged(false);
    } catch (error: unknown) {
      console.error('Update max banners error:', error);
      const err = error as { data?: { error?: string } };
      message.error(err?.data?.error || t('banner.messages.maxBannersUpdateFailed'));
    }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: t('banner.deleteConfirm'),
      content: t('banner.deleteDescription'),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await deleteBanner(id).unwrap();
          message.success(t('banner.messages.deleteSuccess'));
        } catch (error) {
          console.error('Delete banner error:', error);
          message.error(t('banner.messages.deleteFailed'));
        }
      },
    });
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const dragIndex = localBanners.findIndex((b) => b.id === draggingId);
    const dropIndex = localBanners.findIndex((b) => b.id === targetId);

    if (dragIndex === -1 || dropIndex === -1) return;

    // Create new array and swap positions
    const newBanners = [...localBanners];
    const [draggedItem] = newBanners.splice(dragIndex, 1);
    newBanners.splice(dropIndex, 0, draggedItem);

    // Update sort_order based on new positions
    const updatedBanners = newBanners.map((banner, index) => ({
      ...banner,
      sort_order: index,
    }));

    setLocalBanners(updatedBanners);

    // Track all changed sort_orders
    const newPending = new Map(pendingSortOrders);
    updatedBanners.forEach((banner, index) => {
      const originalBanner = banners.find(b => b.id === banner.id);
      if (originalBanner && originalBanner.sort_order !== index) {
        newPending.set(banner.id, index);
      }
    });
    setPendingSortOrders(newPending);

    setDraggingId(null);
  };

  const handleSaveSortOrder = async () => {
    if (pendingSortOrders.size === 0) return;

    try {
      // Update all changed banners in parallel
      await Promise.all(
        Array.from(pendingSortOrders.entries()).map(([id, sort_order]) =>
          updateBanner({ id, dto: { sort_order } }).unwrap()
        )
      );

      message.success(t('banner.messages.reorderSuccess'));
      setPendingSortOrders(new Map());
    } catch (error) {
      console.error('Save sort order error:', error);
      message.error(t('banner.messages.reorderFailed'));
    }
  };

  const handleCancelSortOrder = () => {
    setLocalBanners(banners);
    setPendingSortOrders(new Map());
  };

  const BannerImage = ({ url }: { url: string }) => {
    const signedUrl = useSignedImageUrl(url);
    
    if (!signedUrl) {
      return (
        <div
          style={{
            width: 100,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f0f0',
            borderRadius: 4,
          }}
        >
          <Spin size="small" />
        </div>
      );
    }

    return (
      <Image
        src={signedUrl}
        alt="Banner"
        width={100}
        height={60}
        style={{ objectFit: 'cover', borderRadius: '4px' }}
        preview
      />
    );
  };

  const columns: ColumnsType<Banner> = [
    {
      key: 'drag',
      width: 50,
      render: (_text, record) => (
        <div
          draggable
          onDragStart={() => handleDragStart(record.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(record.id)}
          style={{ cursor: 'move', padding: '8px 0' }}
        >
          <DragOutlined style={{ fontSize: 16, color: '#999' }} />
        </div>
      ),
    },
    {
      title: t('banner.table.image'),
      dataIndex: ['media', 'file_url'],
      key: 'image',
      width: 150,
      render: (url: string) => <BannerImage url={url} />,
    },
    {
      title: t('banner.table.title'),
      dataIndex: 'title',
      key: 'title',
      render: (title: string | null) => title || <Tag color="default">{t('common.noTitle')}</Tag>,
    },
    {
      title: t('banner.table.link'),
      dataIndex: 'link_url',
      key: 'link_url',
      render: (url: string | null) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
            {url.length > 40 ? `${url.slice(0, 40)}...` : url}
          </a>
        ) : (
          <Tag color="default">{t('common.noLink')}</Tag>
        ),
    },
    {
      title: t('banner.table.order'),
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      align: 'center',
    },
    {
      title: t('banner.table.status'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('banner.table.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_text, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/banner/${record.id}`)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            disabled={isDeleting}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={t('banner.list')}
      extra={
        <Space>
          <span style={{ fontSize: 14, color: '#666' }}>
            {t('banner.maxBannersLabel')}:
          </span>
          <InputNumber
            min={1}
            max={20}
            value={maxBannersValue}
            onChange={handleMaxBannersChange}
            style={{ width: 80 }}
            status={validationError ? 'error' : undefined}
          />
          <Button
            type="default"
            icon={<SaveOutlined />}
            onClick={handleSaveMaxBanners}
            disabled={!hasMaxBannersChanged || !!validationError}
            loading={isUpdatingMax}
          >
            {t('banner.saveMaxBanners')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/banner/create')}
            disabled={banners.length >= (maxBannersData?.max_banners || 6)}
          >
            {t('banner.addBanner')}
          </Button>
        </Space>
      }
    >
      {validationError && (
        <Alert
          message={validationError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {banners.length >= (maxBannersData?.max_banners || 6) && !validationError && (
        <Alert
          message={t('banner.maxBannersReached', { max: maxBannersData?.max_banners || 6, current: banners.length })}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={localBanners}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: t('banner.noBanners') }}
        />
      </Spin>
      {pendingSortOrders.size > 0 && (
        <div style={{ marginTop: 16, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleCancelSortOrder}>
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveSortOrder}
          >
            {t('banner.saveSortOrder')} ({pendingSortOrders.size} {t('banner.changesCount')})
          </Button>
        </div>
      )}
    </Card>
  );
};

AdminBannerPage.displayName = 'AdminBannerPage';
