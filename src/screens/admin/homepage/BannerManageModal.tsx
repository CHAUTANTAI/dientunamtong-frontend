'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Image, App, Upload, Space, Typography, Empty } from 'antd';
import { DeleteOutlined, PlusOutlined, HolderOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BannerContent } from '@/types/pageSection';
import { useGetBannersQuery, useCreateBannerMutation, useDeleteBannerMutation } from '@/store/api/bannerApi';
import { useCreateMediaMutation } from '@/store/api/mediaApi';
import { MediaType } from '@/types/media';
import { uploadToSupabase } from '@/utils/supabase';
import type { UploadFile } from 'antd';
import type { Banner } from '@/types/banner';

const { Text } = Typography;

interface BannerManageModalProps {
  open: boolean;
  onClose: () => void;
  content: BannerContent;
  onSave: (content: BannerContent) => void;
}

interface SortableRowProps {
  'data-row-key': string;
  children: React.ReactNode;
}

const SortableRow = ({ children, ...props }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...props}>
      {React.Children.map(children, (child: any) => {
        if (child?.key === 'drag-handle') {
          return React.cloneElement(child, {
            children: (
              <div {...listeners} style={{ cursor: 'grab', padding: '4px' }}>
                {child.props.children}
              </div>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

export default function BannerManageModal({ open, onClose, content, onSave }: BannerManageModalProps) {
  const t = useTranslations('homepageEditor.banner.modal');
  const { message, modal } = App.useApp();

  const { data: allBanners, isLoading } = useGetBannersQuery();
  const [createBanner] = useCreateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [createMedia] = useCreateMediaMutation();

  const [bannerIds, setBannerIds] = useState<string[]>(content?.banner_ids || []);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open) {
      setBannerIds(content?.banner_ids || []);
      setValidationErrors([]);
    }
  }, [open, content]);

  // Get banners that are in our list
  const selectedBanners = bannerIds
    .map(id => allBanners?.find((b: Banner) => b.id === id))
    .filter(Boolean) as Banner[];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = bannerIds.indexOf(active.id as string);
      const newIndex = bannerIds.indexOf(over.id as string);
      const newOrder = arrayMove(bannerIds, oldIndex, newIndex);
      setBannerIds(newOrder);
    }
  };

  const handleDelete = (bannerId: string) => {
    modal.confirm({
      title: t('deleteConfirm'),
      onOk: () => {
        setBannerIds(bannerIds.filter(id => id !== bannerId));
        message.success(t('deleteSuccess'));
      },
    });
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      return `${file.name}: ${t('fileTooLarge')}`;
    }

    if (!validTypes.includes(file.type)) {
      return `${file.name}: ${t('invalidType')}`;
    }

    return null;
  };

  const handleUpload = async (options: { fileList: UploadFile[] }) => {
    const files = options.fileList.map(f => f.originFileObj).filter(Boolean) as File[];
    
    if (files.length === 0) return;

    // Validate all files
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setValidationErrors(errors);

    if (validFiles.length === 0) {
      message.error(t('validationError'));
      return;
    }

    setUploading(true);

    try {
      const newBannerIds: string[] = [];

      for (const file of validFiles) {
        // Upload to Supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { path } = await uploadToSupabase(file, 'banners', { fileName });

        // Create media record first
        const media = await createMedia({
          file_name: fileName,
          file_url: `/${path}`,
          media_type: MediaType.IMAGE,
          mime_type: file.type,
          file_size: file.size,
          is_active: true,
        }).unwrap();

        // Create banner record with media_id
        const result = await createBanner({
          media_id: media.id,
          sort_order: bannerIds.length + newBannerIds.length,
        }).unwrap();

        newBannerIds.push(result.id);
      }

      setBannerIds([...bannerIds, ...newBannerIds]);
      message.success(t('uploadSuccess', { count: newBannerIds.length }));
    } catch (error) {
      console.error('Upload error:', error);
      message.error(t('uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave({
      banner_ids: bannerIds,
      auto_play: true,
      interval: 5000,
      show_arrows: true,
      show_dots: true,
    });
  };

  const columns = [
    {
      key: 'drag-handle',
      width: 50,
      render: () => <HolderOutlined style={{ cursor: 'grab' }} />,
    },
    {
      title: t('table.order'),
      key: 'order',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: t('table.image'),
      dataIndex: 'image_url',
      key: 'image',
      width: 120,
      render: (url: string) => (
        <Image
          src={url}
          alt="Banner"
          width={100}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: t('table.title'),
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => title || '-',
    },
    {
      title: t('table.link'),
      dataIndex: 'link_url',
      key: 'link',
      render: (url: string) => url || '-',
    },
    {
      title: t('table.actions'),
      key: 'actions',
      width: 100,
      render: (_: any, record: Banner) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={t('title')}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          OK
        </Button>,
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Upload Section */}
        <div>
          <Upload
            multiple
            accept="image/jpeg,image/png,image/gif"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUpload}
          >
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="large"
              block
              loading={uploading}
            >
              {t('addBanners')}
            </Button>
          </Upload>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            {t('uploadHint')}
          </Text>
          {validationErrors.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text type="danger">{t('validationError')}</Text>
              {validationErrors.map((err, idx) => (
                <div key={idx}>
                  <Text type="danger" style={{ fontSize: 12 }}>• {err}</Text>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banner List */}
        {selectedBanners.length > 0 ? (
          <>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('dragHint')}
            </Text>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={bannerIds} strategy={verticalListSortingStrategy}>
                <Table
                  dataSource={selectedBanners}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  loading={isLoading}
                  components={{
                    body: {
                      row: SortableRow,
                    },
                  }}
                />
              </SortableContext>
            </DndContext>
          </>
        ) : (
          <Empty description={t('noBanners')} />
        )}
      </Space>
    </Modal>
  );
}
