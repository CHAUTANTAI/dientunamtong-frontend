/**
 * CategoryImageUpload Component
 * Handles image upload flow: Frontend → Supabase Storage → Create Media → Get media_id
 */

'use client';

import { useState } from 'react';
import { Upload, Button, Image, message, Spin } from 'antd';
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { supabase } from '@/utils/supabase';
import { useCreateMediaMutation, useDeleteMediaMutation } from '@/store/api/mediaApi';
import type { Media, MediaType } from '@/types/media';

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

      // Step 1: Upload to Supabase Storage
      const fileName = `category/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Step 2: Get public URL
      const { data: urlData } = supabase.storage
        .from('content')
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Step 3: Create Media record in database
      const mediaData = await createMedia({
        file_name: file.name,
        file_url: uploadData.path, // Store relative path
        media_type: 'image' as MediaType,
        mime_type: file.type,
        file_size: file.size,
        is_active: true,
      }).unwrap();

      // Step 4: Update state and notify parent
      setImageUrl(urlData.publicUrl);
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
  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;

    const success = await handleUpload(file);
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
          <Image
            src={imageUrl}
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

