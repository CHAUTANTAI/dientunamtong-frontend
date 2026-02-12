/**
 * CategoryImageUpload Component
 * Handles image upload flow: Frontend → Supabase Storage → Create Media → Get media_id
 */

'use client';

import { useState } from 'react';
import { Upload, Button, message, Spin } from 'antd';
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { uploadToSupabase } from '@/utils/supabase';
import { useCreateMediaMutation, useDeleteMediaMutation } from '@/store/api/mediaApi';
import type { Media, MediaType } from '@/types/media';
import { ProductImage } from './ProductImage';

interface CategoryImageUploadProps {
  value?: string | null; // media_id
  onChange?: (mediaId: string | null) => void;
  existingMedia?: Media | null; // For editing existing category
  disabled?: boolean;
}

export const CategoryImageUpload = ({
  value,
  onChange,
  existingMedia,
  disabled = false,
}: CategoryImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(
    existingMedia?.file_url || null
  );
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(
    value || existingMedia?.id || null
  );

  const [createMedia] = useCreateMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  /**
   * Handle file upload to Supabase Storage + Create Media record
   */
  const handleUpload = async (file: File): Promise<boolean> => {
    try {
      setUploading(true);

      // Step 1: Upload to Supabase Storage using common utility
      const { path: relativePath } = await uploadToSupabase(file, 'category');

      // Step 2: Create Media record in database
      const mediaData = await createMedia({
        file_name: file.name,
        file_url: relativePath, // Store relative path for signed URL generation
        media_type: 'image' as MediaType,
        mime_type: file.type,
        file_size: file.size,
        is_active: true,
      }).unwrap();

      // Step 3: Update state and notify parent
      setImageUrl(relativePath);
      setCurrentMediaId(mediaData.id);
      onChange?.(mediaData.id);

      message.success('Image uploaded successfully');
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      message.error(
        error instanceof Error ? error.message : 'Failed to upload image'
      );
      return false;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle image removal
   */
  const handleRemove = async () => {
    if (!currentMediaId) return;

    try {
      setUploading(true);

      // Delete media record (backend will handle Supabase Storage deletion)
      await deleteMedia(currentMediaId).unwrap();

      // Clear state
      setImageUrl(null);
      setCurrentMediaId(null);
      onChange?.(null);

      message.success('Image removed successfully');
    } catch (error) {
      console.error('Remove error:', error);
      message.error('Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Custom upload handler (prevents default upload behavior)
   */
  const customRequest = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;

    const success = await handleUpload(file as File);
    if (success) {
      onSuccess?.(null);
    } else {
      onError?.(new Error('Upload failed'));
    }
  };

  /**
   * Validate file before upload
   */
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    return true;
  };

  return (
    <div className="category-image-upload">
      {imageUrl ? (
        // Show existing image with remove button
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <ProductImage
            imageUrl={imageUrl}
            alt="Category"
            width={200}
            height={200}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview
          />
          {!disabled && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              loading={uploading}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ) : (
        // Show upload button
        <Upload
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          showUploadList={false}
          disabled={disabled || uploading}
          accept="image/*"
        >
          <Button
            icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
            disabled={disabled || uploading}
            loading={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </Upload>
      )}

      {uploading && (
        <div style={{ marginTop: 8 }}>
          <Spin size="small" /> Uploading...
        </div>
      )}
    </div>
  );
};

CategoryImageUpload.displayName = 'CategoryImageUpload';

