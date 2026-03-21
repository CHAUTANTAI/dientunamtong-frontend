'use client';

import { useEffect } from 'react';
import { Form, Input, Typography, Space } from 'antd';
import type { BannerHeaderContentDraft } from '@/types/pageSection';
import MediaUpload, { type MediaValue } from '@/components/common/MediaUpload';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface BannerHeaderFormProps {
  content: BannerHeaderContentDraft;
  onChange: (content: BannerHeaderContentDraft) => void;
  form: ReturnType<typeof Form.useForm<Record<string, string>>>[0];
}

/**
 * BannerHeaderForm - Inline form for editing Banner Header
 * Used in Tabs + Accordion layout (no modal)
 */
export default function BannerHeaderForm({
  content,
  onChange,
  form,
}: BannerHeaderFormProps) {
  const t = useTranslations('homepageEditor.forms.bannerHeader');
  
  // Initialize form values when content changes
  useEffect(() => {
    form.setFieldsValue({
      primary_hotline: content?.primary_hotline || '',
      secondary_hotline: content?.secondary_hotline || '',
    });
  }, [content, form]);

  // Get current form values with debounce
  const formValues = Form.useWatch([], form) || {};
  const debouncedFormValues = useDebounce(formValues, 500);

  // Handle debounced form value changes (avoid infinite loop with deep comparison)
  useEffect(() => {
    if (Object.keys(debouncedFormValues).length > 0) {
      const newContent: BannerHeaderContentDraft = {
        logo_media_id: content?.logo_media_id,
        banner_media_id: content?.banner_media_id,
        primary_hotline: debouncedFormValues.primary_hotline || undefined,
        secondary_hotline: debouncedFormValues.secondary_hotline || undefined,
      };
      
      // Only call onChange if values actually changed
      const currentContentStr = JSON.stringify({
        primary_hotline: content?.primary_hotline,
        secondary_hotline: content?.secondary_hotline,
      });
      const newContentStr = JSON.stringify({
        primary_hotline: newContent.primary_hotline,
        secondary_hotline: newContent.secondary_hotline,
      });
      
      if (currentContentStr !== newContentStr) {
        onChange(newContent);
      }
    }
  }, [debouncedFormValues, content?.logo_media_id, content?.banner_media_id, content?.primary_hotline, content?.secondary_hotline]);

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Logo Section */}
        <div>
          <MediaUpload
            value={content?.logo_media_id as MediaValue}
            onChange={(value) => {
              console.log('📸 Logo changed:', value);
              onChange({
                ...content,
                logo_media_id: value as MediaValue,
              });
            }}
            folder="homepage/logo"
            label={t('logoLabel')}
            accept="image/png,image/jpeg,image/svg+xml"
            maxSizeMB={2}
            previewHeight={110}
            previewAspectRatio="contain"
          />
        </div>

        {/* Banner Section */}
        <div>
          <MediaUpload
            value={content?.banner_media_id as MediaValue}
            onChange={(value) => {
              console.log('🖼️ Banner changed:', value);
              onChange({
                ...content,
                banner_media_id: value as MediaValue,
              });
            }}
            folder="homepage/banner"
            label={t('bannerLabel')}
            accept="image/*"
            maxSizeMB={5}
            previewHeight={150}
            previewAspectRatio="contain"
            helperText={t('bannerHelper')}
            minWidth={800}
            minHeight={80}
            maxWidth={2400}
            maxHeight={300}
            aspectRatio={10.9}
            aspectRatioTolerance={0.15}
          />
        </div>

        {/* Hotlines Section */}
        <div>
          <Text strong>{t('hotlinesTitle')}</Text>
          <Form.Item
            name="primary_hotline"
            label={t('primaryHotline')}
            style={{ marginTop: 8, marginBottom: 8 }}
            rules={[
              { pattern: /^[0-9\s\-()]+$/, message: t('invalidPhone') }
            ]}
          >
            <Input
              placeholder={t('hotlinePlaceholder1')}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="secondary_hotline"
            label={t('secondaryHotline')}
            style={{ marginBottom: 0 }}
            rules={[
              { pattern: /^[0-9\s\-()]+$/, message: t('invalidPhone') }
            ]}
          >
            <Input
              placeholder={t('hotlinePlaceholder2')}
              allowClear
            />
          </Form.Item>
        </div>
      </Space>
    </Form>
  );
}
