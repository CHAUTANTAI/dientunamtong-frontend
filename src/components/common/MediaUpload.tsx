'use client';

import { useState, useEffect } from 'react';
import { Upload, Button, Image as AntImage, Space, Typography, App } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { usePublicImageUrl } from '@/hooks/useImageUrl';

const { Text } = Typography;

// Special type to distinguish new uploads from existing paths
export interface PendingUpload {
  file: File;
  previewUrl: string; // Object URL for preview
}

export type MediaValue = string | PendingUpload | null | undefined;

interface MediaUploadProps {
  value?: MediaValue;
  onChange?: (value: MediaValue) => void;
  folder: string; // Will be used during actual upload
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

/**
 * MediaUpload - Reusable component for selecting images
 * NEW BEHAVIOR: Does NOT upload immediately
 * - Stores File object locally with preview
 * - Parent component handles actual upload on Save
 */
export default function MediaUpload({
  value,
  onChange,
  folder,
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5,
}: MediaUploadProps) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const { message } = App.useApp();
  
  // Determine if value is existing path or pending upload
  const isPendingUpload = value && typeof value === 'object' && 'file' in value;
  const isExistingPath = value && typeof value === 'string';
  
  // Get public URL for existing images
  const existingImageUrl = usePublicImageUrl(isExistingPath ? value : undefined);
  
  // Get preview URL (either from pending upload or existing image)
  const previewUrl = isPendingUpload 
    ? (value as PendingUpload).previewUrl 
    : existingImageUrl;

  // Cleanup object URL when component unmounts or value changes
  useEffect(() => {
    return () => {
      if (isPendingUpload) {
        URL.revokeObjectURL((value as PendingUpload).previewUrl);
      }
    };
  }, [value, isPendingUpload]);

  const handleFileSelect = (file: File) => {
    // Validate file size
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      message.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    
    // Store file and preview URL
    const pendingUpload: PendingUpload = {
      file,
      previewUrl: objectUrl,
    };

    onChange?.(pendingUpload);
    message.success('Image selected. Click "Save All Changes" to upload.');
    
    return false; // Prevent default upload behavior
  };

  const handleDelete = () => {
    // Cleanup object URL if it's a pending upload
    if (isPendingUpload) {
      URL.revokeObjectURL((value as PendingUpload).previewUrl);
    }
    onChange?.(null);
    message.info('Image removed');
  };

  const displayPath = isPendingUpload 
    ? `📎 ${(value as PendingUpload).file.name}`
    : isExistingPath 
    ? `📁 ${value}`
    : '';

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {label && <Text strong>{label}</Text>}
      
      {!value ? (
        // Upload button when no image
        <Upload
          accept={accept}
          showUploadList={false}
          beforeUpload={(file) => {
            handleFileSelect(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />} block>
            Click to Select
          </Button>
        </Upload>
      ) : (
        // Preview and actions when image exists
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px', 
          padding: '12px',
          backgroundColor: '#fafafa'
        }}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {/* Image Preview */}
            <div style={{ 
              width: '100%', 
              height: '120px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#fff',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Text type="secondary">Loading preview...</Text>
              )}
            </div>

            {/* Path/File Display */}
            <Text 
              type={isPendingUpload ? 'warning' : 'secondary'}
              style={{ 
                fontSize: 11, 
                wordBreak: 'break-all',
                display: 'block',
                fontWeight: isPendingUpload ? 'bold' : 'normal',
              }}
            >
              {displayPath}
            </Text>

            {/* Action Buttons */}
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setPreviewVisible(true)}
              >
                Preview
              </Button>
              
              <Upload
                accept={accept}
                showUploadList={false}
                beforeUpload={(file) => {
                  handleFileSelect(file);
                  return false;
                }}
              >
                <Button size="small">
                  Replace
                </Button>
              </Upload>

              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Remove
              </Button>
            </Space>
          </Space>

          {/* Full Preview Modal */}
          {previewVisible && previewUrl && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setPreviewVisible(false)}
            >
              <AntImage
                src={previewUrl}
                alt="Full preview"
                style={{ maxWidth: '90%', maxHeight: '90%' }}
                preview={false}
              />
            </div>
          )}
        </div>
      )}
    </Space>
  );
}
