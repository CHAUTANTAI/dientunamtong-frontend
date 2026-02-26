/**
 * ProductMediaUpload Component
 * Separate upload sections for images (max 9) and video (max 1)
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, Button, Card, Space, Tag, Modal, App, Divider } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  VideoCameraOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { ProductImage } from './ProductImage';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';

/**
 * MediaPreview Component - Internal component to render image/video with signed URLs
 */
const MediaPreview = ({ file }: { file: MediaFile }) => {
  // For existing files (from backend), use signed URL
  // For new files (local), use createObjectURL
  const signedUrl = useSignedImageUrl(file.url && !file.file ? file.url : null);
  const previewSrc = file.file ? URL.createObjectURL(file.file) : signedUrl;

  console.log('MediaPreview:', {
    fileUrl: file.url,
    hasFile: !!file.file,
    signedUrl,
    previewSrc,
    type: file.type,
  });

  if (file.type === 'video') {
    return previewSrc ? (
      <video
        src={previewSrc}
        style={{
          width: 150,
          height: 150,
          objectFit: 'cover',
          background: '#000',
        }}
        muted
      />
    ) : (
      <div
        style={{
          width: 150,
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

  // Image
  return previewSrc ? (
    signedUrl && !file.file ? (
      <ProductImage
        imageUrl={signedUrl}
        alt="Preview"
        width={150}
        height={150}
        style={{ objectFit: 'cover' }}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewSrc}
        alt="Preview"
        style={{
          width: 150,
          height: 150,
          objectFit: 'cover',
        }}
      />
    )
  ) : (
    <div
      style={{
        width: 150,
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
  
  // Track processed batch to avoid duplicate warnings - use ref for immediate update
  const processedBatchRef = useRef<Set<string>>(new Set());

  const images = fileList.filter((f) => f.type === 'image');
  const videos = fileList.filter((f) => f.type === 'video');

  /**
   * Handle image selection (multiple) - batch process
   */
  const handleImageBeforeUpload = (file: File, fileListFromUpload: File[]) => {
    // Create batch ID based on fileListFromUpload
    const batchId = fileListFromUpload.map(f => f.name).join(',');
    const isFirstInBatch = !processedBatchRef.current.has(batchId);

    // Only process on first file of the batch
    if (isFirstInBatch) {
      // Mark this batch as processed IMMEDIATELY (using ref, not state)
      processedBatchRef.current.add(batchId);

      // Calculate how many new images we can add
      const currentImageCount = images.length;
      const availableSlots = maxImages - currentImageCount;

      if (availableSlots <= 0) {
        message.error(t('product.media.maxImagesError', { max: maxImages }));
        // Clear after delay
        setTimeout(() => {
          processedBatchRef.current.delete(batchId);
        }, 100);
        return false;
      }

      // Filter valid image files (type and size)
      const validFiles = fileListFromUpload.filter(f => 
        f.type.startsWith('image/') && f.size <= 25 * 1024 * 1024
      );

      // Count invalid files
      const invalidTypeCount = fileListFromUpload.filter(f => !f.type.startsWith('image/')).length;
      const invalidSizeCount = fileListFromUpload.filter(f => 
        f.type.startsWith('image/') && f.size > 25 * 1024 * 1024
      ).length;

      // Take only the files that fit within the limit
      const filesToAdd = validFiles.slice(0, availableSlots);
      const filesExceeded = validFiles.length - filesToAdd.length;

      // Batch add all valid files at once
      if (filesToAdd.length > 0) {
        const newFiles: MediaFile[] = filesToAdd.map((f, index) => ({
          uid: crypto.randomUUID(),
          file: f,
          type: 'image',
          sort_order: fileList.length + index,
        }));

        const updated = [...fileList, ...newFiles];
        onChange?.(updated);
      }

      // Show single comprehensive message
      const messages: string[] = [];
      
      if (filesToAdd.length > 0) {
        messages.push(t('product.media.imagesAdded', { count: filesToAdd.length }));
      }
      
      if (filesExceeded > 0) {
        messages.push(t('product.media.filesExceeded', { count: filesExceeded, max: maxImages }));
      }
      
      if (invalidTypeCount > 0) {
        messages.push(t('product.media.invalidType', { count: invalidTypeCount }));
      }
      
      if (invalidSizeCount > 0) {
        messages.push(t('product.media.invalidSize', { count: invalidSizeCount }));
      }

      // Display appropriate message
      if (messages.length > 0) {
        const fullMessage = messages.join('\n');
        if (filesExceeded > 0 || invalidTypeCount > 0 || invalidSizeCount > 0) {
          message.warning({
            content: fullMessage,
            duration: 5,
          });
        } else {
          message.success(fullMessage);
        }
      }

      // Clear processed batch after a delay
      setTimeout(() => {
        processedBatchRef.current.delete(batchId);
      }, 100);
    }

    return false; // Prevent auto upload
  };

  /**
   * Check video duration using HTML5 Video API
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
   * Handle video selection (single)
   */
  const handleVideoBeforeUpload = async (file: File) => {
    const isVideo = file.type.startsWith('video/');

    if (!isVideo) {
      message.error(t('product.media.onlyVideoAllowed'));
      return false;
    }

    // Check file size (500MB)
    if (file.size > 500 * 1024 * 1024) {
      message.error(t('product.media.videoSizeLimit'));
      return false;
    }

    // Check video duration (2 minutes = 120 seconds)
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

    // Replace existing video if any
    const newFile: MediaFile = {
      uid: crypto.randomUUID(),
      file,
      type: 'video',
      sort_order: fileList.length,
    };

    // Remove old video and add new one
    const withoutVideo = fileList.filter((f) => f.type !== 'video');
    const updated = [...withoutVideo, newFile];
    onChange?.(updated);

    if (videos.length > 0) {
      message.success(t('product.media.videoReplaced'));
    }

    return false; // Prevent auto upload
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
        {/* Images Section */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            {t('product.media.productImages')} ({images.length}/{maxImages})
          </div>

          {images.length > 0 && (
            <Space wrap size="middle" style={{ marginBottom: 12 }}>
              {images.map((file) => {
                return (
                  <Card
                    key={file.uid}
                    size="small"
                    style={{ width: 150 }}
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
                        <span style={{ fontSize: 11 }}>
                          {file.file?.name || t('product.media.existingFile')}
                        </span>
                      }
                    />
                  </Card>
                );
              })}
            </Space>
          )}

          {!disabled && images.length < maxImages && (
            <Upload
              beforeUpload={handleImageBeforeUpload}
              showUploadList={false}
              accept="image/*"
              disabled={disabled}
              multiple
            >
              <Button icon={<PlusOutlined />} block>
                {t('product.media.addImages', { max: maxImages })}
              </Button>
            </Upload>
          )}

          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            • {t('product.media.imageHint1', { max: maxImages })}
            <br />• {t('product.media.imageHint2')}
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
              {videos.map((file) => {
                return (
                  <Card
                    key={file.uid}
                    size="small"
                    style={{ width: 150 }}
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
                );
              })}
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

      {/* Preview Modal with Signed URL support */}
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
 * PreviewModal Component - Handles signed URL conversion for preview
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
  // If URL is a relative path (from backend), convert to signed URL
  // If URL is a data URL (from FileReader), use as is
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
