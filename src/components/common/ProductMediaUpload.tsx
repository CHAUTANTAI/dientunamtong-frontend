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
import { ProductImage } from './ProductImage';

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
        message.error(`Maximum ${maxImages} images allowed!`);
        // Clear after delay
        setTimeout(() => {
          processedBatchRef.current.delete(batchId);
        }, 100);
        return false;
      }

      // Filter valid image files (type and size)
      const validFiles = fileListFromUpload.filter(f => 
        f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
      );

      // Count invalid files
      const invalidTypeCount = fileListFromUpload.filter(f => !f.type.startsWith('image/')).length;
      const invalidSizeCount = fileListFromUpload.filter(f => 
        f.type.startsWith('image/') && f.size > 5 * 1024 * 1024
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
        messages.push(`✓ Added ${filesToAdd.length} image(s)`);
      }
      
      if (filesExceeded > 0) {
        messages.push(`✗ ${filesExceeded} file(s) exceeded the limit of ${maxImages} images`);
      }
      
      if (invalidTypeCount > 0) {
        messages.push(`✗ ${invalidTypeCount} file(s) are not images`);
      }
      
      if (invalidSizeCount > 0) {
        messages.push(`✗ ${invalidSizeCount} file(s) exceed 5MB size limit`);
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
   * Handle video selection (single)
   */
  const handleVideoBeforeUpload = (file: File) => {
    const isVideo = file.type.startsWith('video/');

    if (!isVideo) {
      message.error('You can only upload video files!');
      return false;
    }

    // Check file size
    if (file.size > 100 * 1024 * 1024) {
      message.error('Video size must be less than 100MB!');
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
      message.success('Video replaced successfully!');
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
            Product Images ({images.length}/{maxImages})
          </div>

          {images.length > 0 && (
            <Space wrap size="middle" style={{ marginBottom: 12 }}>
              {images.map((file) => {
                // Create preview URL from File object or use existing URL
                const previewSrc = file.url || (file.file ? URL.createObjectURL(file.file) : null);
                
                return (
                  <Card
                    key={file.uid}
                    size="small"
                    style={{ width: 150 }}
                    cover={
                      previewSrc ? (
                        file.url ? (
                          <ProductImage
                            imageUrl={file.url}
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
                      )
                    }
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
                          {file.file?.name || 'Existing file'}
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
                Add Images (Max {maxImages})
              </Button>
            </Upload>
          )}

          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            • Select multiple images at once (max {maxImages} total)
            <br />• Max file size: 5MB per image
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Video Section */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Demo Video ({videos.length}/{maxVideos})
          </div>

          {videos.length > 0 && (
            <Space wrap size="middle" style={{ marginBottom: 12 }}>
              {videos.map((file) => {
                // Create preview URL from File object or use existing URL
                const previewSrc = file.url || (file.file ? URL.createObjectURL(file.file) : null);
                
                return (
                  <Card
                    key={file.uid}
                    size="small"
                    style={{ width: 150 }}
                    cover={
                      previewSrc ? (
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
                      )
                    }
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
                          <Tag color="green">VIDEO</Tag>
                          <span style={{ fontSize: 11 }}>
                            {file.file?.name || 'Existing file'}
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
              {videos.length > 0 ? 'Replace Video' : 'Add Video'}
            </Button>
          </Upload>

          <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            • Only 1 video allowed (selecting new video will replace current)
            <br />• Max file size: 100MB
          </div>
        </div>
      </Space>

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        title="Preview"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={800}
      >
        {previewType === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Preview" style={{ width: '100%' }} />
        ) : (
          <video src={previewUrl} controls style={{ width: '100%' }} />
        )}
      </Modal>
    </>
  );
};

ProductMediaUpload.displayName = 'ProductMediaUpload';
