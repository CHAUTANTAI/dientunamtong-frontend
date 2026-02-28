/**
 * ProductMediaUpload Component
 * - Featured image (sort_order = 0)
 * - 8 additional images in 4x4 grid with drag & drop sorting
 * - 1 video
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, Button, Card, Space, Tag, Modal, App, Divider, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  FileImageOutlined,
  StarFilled,
  DragOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { ProductImage } from './ProductImage';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * MediaPreview Component - Internal component to render image/video with signed URLs
 */
const MediaPreview = ({ file }: { file: MediaFile }) => {
  const signedUrl = useSignedImageUrl(file.url && !file.file ? file.url : null);
  const previewSrc = file.file ? URL.createObjectURL(file.file) : signedUrl;

  if (file.type === 'video') {
    return previewSrc ? (
      <video
        src={previewSrc}
        style={{
          width: '100%',
          height: 150,
          objectFit: 'cover',
          background: '#000',
        }}
        muted
      />
    ) : (
      <div
        style={{
          width: '100%',
          height: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f0f0',
        }}
      >
        <VideoCameraOutlined style={{ fontSize: 32, color: '#52c41a' }} />
      </div>
    );
  }

  return previewSrc ? (
    signedUrl && !file.file ? (
      <ProductImage
        imageUrl={signedUrl}
        alt="Preview"
        width={200}
        height={150}
        style={{ objectFit: 'cover' }}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewSrc}
        alt="Preview"
        style={{
          width: '100%',
          height: 150,
          objectFit: 'cover',
        }}
      />
    )
  ) : (
    <div
      style={{
        width: '100%',
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
      }}
    >
      <FileImageOutlined style={{ fontSize: 32, color: '#999' }} />
    </div>
  );
};

/**
 * Sortable Image Card
 */
const SortableImageCard = ({
  file,
  onRemove,
  onPreview,
}: {
  file: MediaFile;
  onRemove: () => void;
  onPreview: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{ width: '100%' }}
        cover={
          <div style={{ position: 'relative' }}>
            <MediaPreview file={file} />
            <div
              {...attributes}
              {...listeners}
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 4,
                cursor: 'grab',
                fontSize: 12,
              }}
            >
              <DragOutlined />
            </div>
          </div>
        }
        actions={[
          <EyeOutlined key="preview" onClick={onPreview} />,
          <DeleteOutlined
            key="delete"
            onClick={onRemove}
            style={{ color: '#ff4d4f' }}
          />,
        ]}
      >
        <Card.Meta
          description={
            <span style={{ fontSize: 11 }}>
              {file.file?.name || 'Existing file'}
            </span>
          }
        />
      </Card>
    </div>
  );
};

export interface MediaFile {
  uid: string;
  file?: File;
  url?: string;
  type: 'image' | 'video';
  sort_order: number;
}

interface ProductMediaUploadProps {
  value?: MediaFile[];
  onChange?: (files: MediaFile[]) => void;
  disabled?: boolean;
  maxImages?: number;
  maxVideos?: number;
}

export const ProductMediaUpload = ({
  value = [],
  onChange,
  disabled = false,
  maxImages = 9,
  maxVideos = 1,
}: ProductMediaUploadProps) => {
  const t = useTranslations();
  const { message } = App.useApp();
  const fileList = value;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');
  
  const processedBatchRef = useRef<Set<string>>(new Set());

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const images = fileList.filter((f) => f.type === 'image');
  const videos = fileList.filter((f) => f.type === 'video');

  // Featured image (sort_order = 0)
  const featuredImage = images.find((img) => img.sort_order === 0);
  // Other images (sort_order > 0), sorted
  const otherImages = images
    .filter((img) => img.sort_order > 0)
    .sort((a, b) => a.sort_order - b.sort_order);

  /**
   * Handle drag end for sorting images
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = otherImages.findIndex((img) => img.uid === active.id);
    const newIndex = otherImages.findIndex((img) => img.uid === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(otherImages, oldIndex, newIndex);
    
    // Update sort_order (starting from 1, as 0 is featured)
    const updatedOtherImages = reordered.map((img, index) => ({
      ...img,
      sort_order: index + 1,
    }));

    // Combine with featured and videos
    const allFiles = [
      ...(featuredImage ? [featuredImage] : []),
      ...updatedOtherImages,
      ...videos,
    ];

    onChange?.(allFiles);
  };

  /**
   * Handle image upload - Now distinguishes featured vs additional
   */
  const handleImageBeforeUpload = (file: File, fileListFromUpload: File[], isFeatured: boolean) => {
    const batchId = fileListFromUpload.map(f => f.name).join(',');
    const isFirstInBatch = !processedBatchRef.current.has(batchId);

    if (isFirstInBatch) {
      processedBatchRef.current.add(batchId);

      // For featured image, only allow 1
      if (isFeatured) {
        if (fileListFromUpload.length > 1) {
          message.warning('Featured image: only 1 image allowed');
          setTimeout(() => processedBatchRef.current.delete(batchId), 100);
          return false;
        }

        const file = fileListFromUpload[0];
        if (!file.type.startsWith('image/')) {
          message.error(t('product.media.onlyImageAllowed'));
          setTimeout(() => processedBatchRef.current.delete(batchId), 100);
          return false;
        }

        if (file.size > 25 * 1024 * 1024) {
          message.error(t('product.media.imageSizeLimit'));
          setTimeout(() => processedBatchRef.current.delete(batchId), 100);
          return false;
        }

        const newFile: MediaFile = {
          uid: crypto.randomUUID(),
          file,
          type: 'image',
          sort_order: 0, // Featured image always sort_order = 0
        };

        // Remove old featured image if exists
        const withoutFeatured = fileList.filter((f) => f.type !== 'image' || f.sort_order !== 0);
        const updated = [newFile, ...withoutFeatured];
        onChange?.(updated);
        message.success('Featured image added');
        setTimeout(() => processedBatchRef.current.delete(batchId), 100);
        return false;
      }

      // For additional images
      const currentOtherImageCount = otherImages.length;
      const availableSlots = (maxImages - 1) - currentOtherImageCount; // -1 for featured

      if (availableSlots <= 0) {
        message.error(`Maximum ${maxImages - 1} additional images allowed`);
        setTimeout(() => processedBatchRef.current.delete(batchId), 100);
        return false;
      }

      const validFiles = fileListFromUpload.filter(f => 
        f.type.startsWith('image/') && f.size <= 25 * 1024 * 1024
      );

      const invalidTypeCount = fileListFromUpload.filter(f => !f.type.startsWith('image/')).length;
      const invalidSizeCount = fileListFromUpload.filter(f => 
        f.type.startsWith('image/') && f.size > 25 * 1024 * 1024
      ).length;

      const filesToAdd = validFiles.slice(0, availableSlots);
      const filesExceeded = validFiles.length - filesToAdd.length;

      if (filesToAdd.length > 0) {
        // Start sort_order from 1 + current max
        const maxSortOrder = otherImages.length > 0 
          ? Math.max(...otherImages.map(img => img.sort_order))
          : 0;

        const newFiles: MediaFile[] = filesToAdd.map((f, index) => ({
          uid: crypto.randomUUID(),
          file: f,
          type: 'image',
          sort_order: maxSortOrder + index + 1,
        }));

        const updated = [...fileList, ...newFiles];
        onChange?.(updated);
      }

      const messages: string[] = [];
      
      if (filesToAdd.length > 0) {
        messages.push(t('product.media.imagesAdded', { count: filesToAdd.length }));
      }
      
      if (filesExceeded > 0) {
        messages.push(t('product.media.filesExceeded', { count: filesExceeded, max: maxImages - 1 }));
      }
      
      if (invalidTypeCount > 0) {
        messages.push(t('product.media.invalidType', { count: invalidTypeCount }));
      }
      
      if (invalidSizeCount > 0) {
        messages.push(t('product.media.invalidSize', { count: invalidSizeCount }));
      }

      if (messages.length > 0) {
        const fullMessage = messages.join('\n');
        if (filesExceeded > 0 || invalidTypeCount > 0 || invalidSizeCount > 0) {
          message.warning({ content: fullMessage, duration: 5 });
        } else {
          message.success(fullMessage);
        }
      }

      setTimeout(() => processedBatchRef.current.delete(batchId), 100);
    }

    return false;
  };

  /**
   * Check video duration
   */
  const checkVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  /**
   * Handle video upload
   */
  const handleVideoBeforeUpload = async (file: File) => {
    const isVideo = file.type.startsWith('video/');

    if (!isVideo) {
      message.error(t('product.media.onlyVideoAllowed'));
      return false;
    }

    if (file.size > 500 * 1024 * 1024) {
      message.error(t('product.media.videoSizeLimit'));
      return false;
    }

    try {
      const duration = await checkVideoDuration(file);
      const durationInMinutes = Math.floor(duration / 60);
      const durationInSeconds = Math.floor(duration % 60);
      
      if (duration > 120) {
        message.error(
          t('product.media.videoDurationLimit', { 
            duration: `${durationInMinutes}:${durationInSeconds.toString().padStart(2, '0')}` 
          })
        );
        return false;
      }
    } catch (error) {
      console.error('Error checking video duration:', error);
      message.error(t('product.media.videoMetadataError'));
      return false;
    }

    const newFile: MediaFile = {
      uid: crypto.randomUUID(),
      file,
      type: 'video',
      sort_order: fileList.length,
    };

    const withoutVideo = fileList.filter((f) => f.type !== 'video');
    const updated = [...withoutVideo, newFile];
    onChange?.(updated);

    if (videos.length > 0) {
      message.success(t('product.media.videoReplaced'));
    }

    return false;
  };

  /**
   * Remove file
   */
  const handleRemove = (uid: string) => {
    const updated = fileList.filter((f) => f.uid !== uid);
    onChange?.(updated);
  };

  /**
   * Preview file
   */
  const handlePreview = (file: MediaFile) => {
    if (file.url) {
      setPreviewUrl(file.url);
      setPreviewType(file.type);
      setPreviewOpen(true);
    } else if (file.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setPreviewType(file.type);
        setPreviewOpen(true);
      };
      reader.readAsDataURL(file.file);
    }
  };

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Featured Image Section */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarFilled style={{ color: '#faad14' }} />
            Featured Image (Required)
          </div>

          {featuredImage ? (
            <Card
              size="small"
              style={{ width: 250 }}
              cover={<MediaPreview file={featuredImage} />}
              actions={[
                <EyeOutlined key="preview" onClick={() => handlePreview(featuredImage)} />,
                <DeleteOutlined
                  key="delete"
                  onClick={() => handleRemove(featuredImage.uid)}
                  style={{ color: '#ff4d4f' }}
                />,
              ]}
            >
              <Card.Meta
                description={
                  <Space direction="vertical" size={0}>
                    <Tag color="gold">Featured</Tag>
                    <span style={{ fontSize: 11 }}>
                      {featuredImage.file?.name || 'Existing file'}
                    </span>
                  </Space>
                }
              />
            </Card>
          ) : (
            <Upload
              beforeUpload={(file, fileList) => handleImageBeforeUpload(file, fileList, true)}
              showUploadList={false}
              accept="image/*"
              disabled={disabled}
            >
              <Button icon={<PlusOutlined />} size="large" style={{ width: 250, height: 180 }}>
                Upload Featured Image
              </Button>
            </Upload>
          )}

          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            • This image will be shown as the main product image
            <br />• Max file size: 25MB
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Additional Images Section with Drag & Drop */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Additional Images ({otherImages.length}/{maxImages - 1})
          </div>

          {otherImages.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={otherImages.map(img => img.uid)}
                strategy={rectSortingStrategy}
              >
                <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                  {otherImages.map((file) => (
                    <Col key={file.uid} xs={12} sm={12} md={6}>
                      <SortableImageCard
                        file={file}
                        onRemove={() => handleRemove(file.uid)}
                        onPreview={() => handlePreview(file)}
                      />
                    </Col>
                  ))}
                </Row>
              </SortableContext>
            </DndContext>
          )}

          {!disabled && otherImages.length < (maxImages - 1) && (
            <Upload
              beforeUpload={(file, fileList) => handleImageBeforeUpload(file, fileList, false)}
              showUploadList={false}
              accept="image/*"
              disabled={disabled}
              multiple
            >
              <Button icon={<PlusOutlined />} block>
                Add More Images (Max {maxImages - 1})
              </Button>
            </Upload>
          )}

          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            • Drag and drop to reorder images
            <br />• Max file size: 25MB per image
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Video Section */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            {t('product.media.demoVideo')} ({videos.length}/{maxVideos})
          </div>

          {videos.length > 0 && (
            <Space wrap size="middle" style={{ marginBottom: 12 }}>
              {videos.map((file) => (
                <Card
                  key={file.uid}
                  size="small"
                  style={{ width: 250 }}
                  cover={<MediaPreview file={file} />}
                  actions={[
                    <EyeOutlined key="preview" onClick={() => handlePreview(file)} />,
                    <DeleteOutlined
                      key="delete"
                      onClick={() => handleRemove(file.uid)}
                      style={{ color: '#ff4d4f' }}
                    />,
                  ]}
                >
                  <Card.Meta
                    description={
                      <Space direction="vertical" size={0}>
                        <Tag color="green">{t('product.labels.video')}</Tag>
                        <span style={{ fontSize: 11 }}>
                          {file.file?.name || t('product.media.existingFile')}
                        </span>
                      </Space>
                    }
                  />
                </Card>
              ))}
            </Space>
          )}

          <Upload
            beforeUpload={handleVideoBeforeUpload}
            showUploadList={false}
            accept="video/*"
            disabled={disabled}
          >
            <Button icon={<VideoCameraOutlined />} block>
              {videos.length > 0 ? t('product.media.replaceVideo') : t('product.media.addVideo')}
            </Button>
          </Upload>

          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            • {t('product.media.videoHint1')}
            <br />• {t('product.media.videoHint2')}
          </div>
        </div>
      </Space>

      {/* Preview Modal */}
      <PreviewModal
        open={previewOpen}
        url={previewUrl}
        type={previewType}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
};

/**
 * PreviewModal Component
 */
const PreviewModal = ({
  open,
  url,
  type,
  onClose,
}: {
  open: boolean;
  url: string;
  type: 'image' | 'video';
  onClose: () => void;
}) => {
  const t = useTranslations();
  const isDataUrl = url.startsWith('data:');
  const signedUrl = useSignedImageUrl(!isDataUrl && url ? url : null);
  const displayUrl = isDataUrl ? url : signedUrl;

  return (
    <Modal open={open} title={t('product.media.preview')} footer={null} onCancel={onClose} width={800}>
      {type === 'image' ? (
        displayUrl ? (
          <ProductImage imageUrl={displayUrl} alt={t('product.media.preview')} width="100%" />
        ) : (
          <div>{t('common.loading')}</div>
        )
      ) : displayUrl ? (
        <video src={displayUrl} controls style={{ width: '100%', maxHeight: '80vh' }} />
      ) : (
        <div>{t('common.loading')}</div>
      )}
    </Modal>
  );
};

ProductMediaUpload.displayName = 'ProductMediaUpload';
