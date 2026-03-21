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
  previewHeight?: number; // Custom preview height (default: 120px)
  previewAspectRatio?: 'auto' | 'cover' | 'contain'; // How image fits in preview
  helperText?: string; // Additional helper text (e.g., recommended dimensions)
  minWidth?: number; // Minimum width validation
  minHeight?: number; // Minimum height validation
  maxWidth?: number; // Maximum width validation
  maxHeight?: number; // Maximum height validation
  aspectRatio?: number; // Expected aspect ratio (width/height)
  aspectRatioTolerance?: number; // Tolerance for aspect ratio (default: 0.1)
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
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5,
  previewHeight = 120,
  previewAspectRatio = 'contain',
  helperText,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  aspectRatio,
  aspectRatioTolerance = 0.1,
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

    // Validate image dimensions using Image API
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const imgAspectRatio = width / height;
      
      // Validation checks
      const errors: string[] = [];
      
      if (minWidth && width < minWidth) {
        errors.push(`Width must be at least ${minWidth}px (current: ${width}px)`);
      }
      if (minHeight && height < minHeight) {
        errors.push(`Height must be at least ${minHeight}px (current: ${height}px)`);
      }
      if (maxWidth && width > maxWidth) {
        errors.push(`Width must be at most ${maxWidth}px (current: ${width}px)`);
      }
      if (maxHeight && height > maxHeight) {
        errors.push(`Height must be at most ${maxHeight}px (current: ${height}px)`);
      }
      if (aspectRatio) {
        const diff = Math.abs(imgAspectRatio - aspectRatio);
        const tolerance = aspectRatio * aspectRatioTolerance;
        if (diff > tolerance) {
          const expectedRatio = `${aspectRatio.toFixed(2)}:1`;
          const currentRatio = `${imgAspectRatio.toFixed(2)}:1`;
          errors.push(`Aspect ratio should be approximately ${expectedRatio} (current: ${currentRatio})`);
        }
      }
      
      // If validation fails, show errors and cleanup
      if (errors.length > 0) {
        URL.revokeObjectURL(objectUrl);
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Image validation failed:</div>
              {errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          ),
          duration: 6,
        });
        return;
      }
      
      // Validation passed - store file and preview URL
      const pendingUpload: PendingUpload = {
        file,
        previewUrl: objectUrl,
      };

      onChange?.(pendingUpload);
      message.success(`Image selected (${width}×${height}px). Click "Save All Changes" to upload.`);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      message.error('Failed to load image. Please try another file.');
    };
    
    img.src = objectUrl;
    
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
      {helperText && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: -8, marginBottom: 8 }}>
          💡 {helperText}
        </Text>
      )}
      
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
              height: `${previewHeight}px`, 
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
                    objectFit: previewAspectRatio === 'auto' ? 'contain' : previewAspectRatio,
                    width: previewAspectRatio === 'cover' ? '100%' : 'auto',
                    height: previewAspectRatio === 'cover' ? '100%' : 'auto',
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
