'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Image, App, Upload, Space, Typography, Empty } from 'antd';
import { DeleteOutlined, PlusOutlined, HolderOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BannerContent } from '@/types/pageSection';
import type { PendingBanner } from '@/types/banner';
import type { UploadFile } from 'antd';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;

interface BannerManageModalProps {
  open: boolean;
  onClose: () => void;
  content: BannerContent;
  onSave: (pendingBanners: PendingBanner[]) => void; // Changed: return pending banners instead of content
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
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.key === 'drag-handle') {
          const childElement = child as React.ReactElement<{ children?: React.ReactNode }>;
          return React.cloneElement(childElement, {
            children: (
              <div {...listeners} style={{ cursor: 'grab', padding: '4px' }}>
                {childElement.props.children}
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
  const { message } = App.useApp();

  const [pendingBanners, setPendingBanners] = useState<PendingBanner[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open) {
      // Reset on modal open - no existing banners to load
      setPendingBanners([]);
      setValidationErrors([]);
    }
  }, [open]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      pendingBanners.forEach(banner => {
        if (banner.previewUrl) {
          URL.revokeObjectURL(banner.previewUrl);
        }
      });
    };
  }, [pendingBanners]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPendingBanners((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update sort_order
        return newOrder.map((item, index) => ({
          ...item,
          sort_order: index,
        }));
      });
    }
  };

  const handleDelete = (id: string) => {
    const banner = pendingBanners.find(b => b.id === id);
    if (banner?.previewUrl) {
      URL.revokeObjectURL(banner.previewUrl);
    }
    
    setPendingBanners(prev => {
      const filtered = prev.filter(b => b.id !== id);
      // Reorder
      return filtered.map((b, index) => ({ ...b, sort_order: index }));
    });
    
    message.success(t('deleteSuccess'));
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (file.size > maxSize) {
      return `${file.name}: ${t('fileTooLarge')}`;
    }

    if (!validTypes.includes(file.type)) {
      return `${file.name}: ${t('invalidType')}`;
    }

    return null;
  };

  const handleUpload = (options: { fileList: UploadFile[] }) => {
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

    // Create pending banners with preview URLs
    const newPendingBanners: PendingBanner[] = validFiles.map((file, index) => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
      sort_order: pendingBanners.length + index,
    }));

    setPendingBanners([...pendingBanners, ...newPendingBanners]);
    message.success(t('uploadSuccess', { count: validFiles.length }));
  };

  const handleSave = () => {
    onSave(pendingBanners);
    onClose();
  };

  const handleClose = () => {
    // Cleanup all preview URLs
    pendingBanners.forEach(banner => {
      if (banner.previewUrl) {
        URL.revokeObjectURL(banner.previewUrl);
      }
    });
    onClose();
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
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: t('table.image'),
      key: 'image',
      width: 120,
      render: (_: unknown, record: PendingBanner) => (
        <Image
          src={record.previewUrl}
          alt="Banner preview"
          width={100}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
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
      render: (_: unknown, record: PendingBanner) => (
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
      onCancel={handleClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleClose}>
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
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleUpload}
          >
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="large"
              block
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
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>
                    <Text type="danger" style={{ fontSize: 12 }}>{error}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Banner Table */}
        {pendingBanners.length === 0 ? (
          <Empty
            description={t('noBanners')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              {t('dragHint')}
            </Text>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pendingBanners.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table
                  dataSource={pendingBanners}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  components={{
                    body: {
                      row: SortableRow,
                    },
                  }}
                  onRow={(record) => ({
                    'data-row-key': record.id,
                  } as React.HTMLAttributes<HTMLElement>)}
                />
              </SortableContext>
            </DndContext>
          </div>
        )}

        <Text type="warning" style={{ fontSize: 12 }}>
          ⚠️ Banners will be uploaded when you click "Save All Changes" on the Homepage Editor.
        </Text>
      </Space>
    </Modal>
  );
}
