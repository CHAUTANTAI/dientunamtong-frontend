/**
 * ProductMediaUpload Component
 * Multiple file upload: max 9 images + 1 video (total 10)
 * With preview, sort, and delete functionality
 */

'use client';

import { useState } from 'react';
import { Upload, Button, Card, Space, Tag, Modal, App } from 'antd';
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
  maxImages?: number; // Default 9
  maxVideos?: number; // Default 1
}

export const ProductMediaUpload = ({
  value = [],
  onChange,
  disabled = false,
  maxImages = 9,
  maxVideos = 1,
}: ProductMediaUploadProps) => {
  const { message } = App.useApp();
  // Use value directly instead of maintaining separate state
  const fileList = value;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');

  const imageCount = fileList.filter((f) => f.type === 'image').length;
  const videoCount = fileList.filter((f) => f.type === 'video').length;

  /**
   * Handle file selection
   */
  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      message.error('You can only upload image or video files!');
      return false;
    }

    // Check limits
    if (isImage && imageCount >= maxImages) {
      message.error(`Maximum ${maxImages} images allowed!`);
      return false;
    }

    if (isVideo && videoCount >= maxVideos) {
      message.error(`Maximum ${maxVideos} video allowed!`);
      return false;
    }

    if (fileList.length >= maxImages + maxVideos) {
      message.error(`Maximum ${maxImages + maxVideos} files allowed!`);
      return false;
    }

    // Check file size
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB for video, 5MB for image
    if (file.size > maxSize) {
      message.error(
        `File size exceeds limit: ${isVideo ? '100MB' : '5MB'} maximum!`
      );
      return false;
    }

    // Add to file list
    const newFile: MediaFile = {
      uid: `${Date.now()}-${file.name}`,
      file,
      type: isImage ? 'image' : 'video',
      sort_order: fileList.length,
    };

    const updated = [...fileList, newFile];
    onChange?.(updated);

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
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* File List */}
        {fileList.length > 0 && (
          <Space wrap size="middle">
            {fileList.map((file) => (
              <Card
                key={file.uid}
                size="small"
                style={{ width: 150 }}
                cover={
                  file.type === 'image' ? (
                    file.url ? (
                      <ProductImage
                        imageUrl={file.url}
                        alt="Preview"
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover' }}
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
                        <FileImageOutlined style={{ fontSize: 32, color: '#999' }} />
                      </div>
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
                      <VideoCameraOutlined style={{ fontSize: 32, color: '#999' }} />
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
                      <Tag color={file.type === 'image' ? 'blue' : 'green'}>
                        {file.type.toUpperCase()}
                      </Tag>
                      <span style={{ fontSize: 11 }}>
                        {file.file?.name || 'Existing file'}
                      </span>
                    </Space>
                  }
                />
              </Card>
            ))}
          </Space>
        )}

        {/* Upload Button */}
        {!disabled && fileList.length < maxImages + maxVideos && (
          <Upload
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
            accept="image/*,video/*"
            disabled={disabled}
          >
            <Button icon={<PlusOutlined />} block>
              Add Media ({fileList.length}/{maxImages + maxVideos})
            </Button>
          </Upload>
        )}

        {/* Info */}
        <div style={{ fontSize: 12, color: '#999' }}>
          <p style={{ margin: 0 }}>
            • Images: {imageCount}/{maxImages}
          </p>
          <p style={{ margin: 0 }}>
            • Videos: {videoCount}/{maxVideos}
          </p>
          <p style={{ margin: 0 }}>• Max file size: 5MB (images), 100MB (videos)</p>
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
