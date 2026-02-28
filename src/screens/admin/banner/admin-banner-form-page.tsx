'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, Form, Input, Select, Switch, Button, App, Upload, Image as AntImage, Spin } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useGetBannerQuery,
  useGetAvailableSortOrdersQuery,
} from '@/store/api/bannerApi';
import { useCreateMediaMutation } from '@/store/api/mediaApi';
import { uploadToSupabase } from '@/utils/supabase';
import { useSignedImageUrl } from '@/hooks/useSignedImageUrl';
import { MediaType } from '@/types/media';
import type { UploadFile, UploadProps } from 'antd';

export const AdminBannerFormPage = () => {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const bannerId = params?.id as string | undefined;
  const isEditMode = Boolean(bannerId);

  const { data: banner, isLoading: isLoadingBanner } = useGetBannerQuery(bannerId!, {
    skip: !isEditMode,
  });

  const { data: sortOrderData, isLoading: isLoadingSortOrders } = useGetAvailableSortOrdersQuery(
    isEditMode && bannerId ? { excludeId: bannerId } : undefined
  );

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [createMedia] = useCreateMediaMutation();

  const [imageFile, setImageFile] = useState<UploadFile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const hasSetDefaultSortOrder = useRef(false);

  const existingImageUrl = useSignedImageUrl(banner?.media?.file_url || '');

  // Set default sort_order for create mode
  useEffect(() => {
    if (!isEditMode && sortOrderData && !hasSetDefaultSortOrder.current && !form.getFieldValue('sort_order')) {
      form.setFieldValue('sort_order', sortOrderData.default);
      hasSetDefaultSortOrder.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrderData, isEditMode]);

  useEffect(() => {
    if (isEditMode && banner) {
      form.setFieldsValue({
        title: banner.title,
        link_url: banner.link_url,
        sort_order: banner.sort_order,
        is_active: banner.is_active,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner, isEditMode]);

  const handleImageChange: UploadProps['onChange'] = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0];
      setImageFile(file as UploadFile);

      // Preview
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file.originFileObj);
      }
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const beforeUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(t('banner.messages.onlyImageAllowed'));
      return Upload.LIST_IGNORE;
    }
    const isLt25M = file.size / 1024 / 1024 < 25;
    if (!isLt25M) {
      message.error(t('banner.messages.imageSizeLimit'));
      return Upload.LIST_IGNORE;
    }

    // Validate image dimensions - REQUIRED
    return new Promise<boolean | typeof Upload.LIST_IGNORE>((resolve) => {
      const img = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const ratio = width / height;

        // REQUIRED: Minimum dimensions
        if (width < 1200) {
          message.error(t('banner.messages.imageWidthTooSmall', { width }));
          resolve(Upload.LIST_IGNORE);
          return;
        }

        if (height < 300) {
          message.error(t('banner.messages.imageHeightTooSmall', { height }));
          resolve(Upload.LIST_IGNORE);
          return;
        }

        // WARNING only: Aspect ratio recommendation (still allow upload)
        if (ratio < 2 || ratio > 4) {
          message.warning(
            t('banner.messages.imageRatioWarning', { ratio: ratio.toFixed(2) })
          );
        }

        resolve(false); // Prevent auto upload but allow file selection
      };

      img.onerror = () => {
        message.error('Failed to load image');
        resolve(Upload.LIST_IGNORE);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (values: {
    title?: string;
    link_url?: string;
    sort_order?: number;
    is_active?: boolean;
  }) => {
    try {
      setUploading(true);
      let mediaId = banner?.media_id;
      console.log('🎯 [1] Initial mediaId:', mediaId);
      console.log('🎯 [2] imageFile:', imageFile);

      // Upload new image if provided
      if (imageFile?.originFileObj) {
        console.log('🎯 [3] Uploading new image...');
        const file = imageFile.originFileObj as File;

        // Upload to Supabase
        const { path } = await uploadToSupabase(file, 'banner-images');
        console.log('🎯 [4] Uploaded to Storage:', path);

        // Create media record
        const mediaRecord = await createMedia({
          file_url: path,
          file_name: file.name,
          file_size: file.size,
          media_type: MediaType.IMAGE,
        }).unwrap();
        console.log('🎯 [5] Created media record:', mediaRecord);

        mediaId = mediaRecord.id;
        console.log('🎯 [6] New mediaId:', mediaId);
      }

      if (!mediaId) {
        message.error(t('banner.messages.imageRequired'));
        return;
      }

      const dto = {
        media_id: mediaId,
        title: values.title || null,
        link_url: values.link_url || null,
        sort_order: values.sort_order ?? 0,
        is_active: values.is_active ?? true,
      };

      console.log('🎯 [7] Submitting DTO:', dto);
      console.log('🎯 [8] isEditMode:', isEditMode);

      if (isEditMode) {
        await updateBanner({ id: bannerId!, dto }).unwrap();
        message.success(t('banner.messages.updateSuccess'));
      } else {
        await createBanner(dto).unwrap();
        message.success(t('banner.messages.createSuccess'));
      }

      router.push('/admin/banner');
    } catch (error) {
      console.error('Submit banner error:', error);
      const apiError = error as { data?: { message?: string } };
      if (apiError?.data?.message?.includes('Maximum 6 banners')) {
        message.error(t('banner.maxBannersReached'));
      } else {
        message.error(
          isEditMode ? t('banner.messages.updateFailed') : t('banner.messages.createFailed')
        );
      }
    } finally {
      setUploading(false);
    }
  };

  if (isEditMode && isLoadingBanner) {
    return (
      <Card>
        <Spin size="large" />
      </Card>
    );
  }

  const currentImageUrl = imagePreview || existingImageUrl;

  return (
    <Card title={isEditMode ? t('banner.edit') : t('banner.create')}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Image Upload */}
        <Form.Item label={t('banner.form.image')} required>
          <Upload
            listType="picture-card"
            maxCount={1}
            accept="image/*"
            fileList={imageFile ? [imageFile] : []}
            onChange={handleImageChange}
            beforeUpload={beforeUpload}
            showUploadList={false}
          >
            {currentImageUrl ? (
              <AntImage
                src={currentImageUrl}
                alt="Banner"
                width="100%"
                height="100%"
                style={{ objectFit: 'cover' }}
                preview={false}
              />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>{t('banner.form.uploadImage')}</div>
              </div>
            )}
          </Upload>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              📏 {t('banner.form.imageRequirements')}
            </div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>{t('banner.form.recommendedSize')}</strong></li>
              <li>{t('banner.form.minimumSize')}</li>
              <li>{t('banner.form.aspectRatio')}</li>
              <li>{t('banner.form.maxFileSize')}</li>
              <li>{t('banner.form.supportedFormats')}</li>
            </ul>
          </div>
          {!isEditMode && !imageFile && (
            <div style={{ color: '#ff4d4f', marginTop: 8 }}>
              {t('banner.messages.imageRequired')}
            </div>
          )}
        </Form.Item>

        {/* Title */}
        <Form.Item name="title" label={t('banner.form.title')}>
          <Input placeholder={t('banner.form.titlePlaceholder')} maxLength={255} />
        </Form.Item>

        {/* Link URL */}
        <Form.Item
          name="link_url"
          label={t('banner.form.linkUrl')}
          rules={[
            {
              type: 'url',
              message: t('banner.form.linkUrlInvalid'),
            },
          ]}
        >
          <Input placeholder={t('banner.form.linkUrlPlaceholder')} />
        </Form.Item>

        {/* Sort Order */}
        <Form.Item
          name="sort_order"
          label={t('banner.form.sortOrder')}
          rules={[{ required: true, message: t('banner.form.sortOrderRequired') }]}
        >
          <Select
            placeholder={t('banner.form.sortOrderPlaceholder')}
            loading={isLoadingSortOrders}
            disabled={isLoadingSortOrders}
            options={sortOrderData?.available.map((value) => ({
              label: `${value} - ${t('banner.form.sortOrderOption', { value })}`,
              value,
            }))}
          />
        </Form.Item>

        {/* Status */}
        <Form.Item
          name="is_active"
          label={t('banner.form.status')}
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren={t('common.active')} unCheckedChildren={t('common.inactive')} />
        </Form.Item>

        {/* Actions */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating || uploading}
            icon={<UploadOutlined />}
          >
            {isEditMode ? t('common.update') : t('common.create')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => router.back()}>
            {t('common.cancel')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

AdminBannerFormPage.displayName = 'AdminBannerFormPage';
