'use client';

import { useEffect } from 'react';
import { Form, Input, Typography, Space } from 'antd';
import type { BannerHeaderContentDraft } from '@/types/pageSection';
import MediaUpload, { type MediaValue } from '@/components/common/MediaUpload';

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
  
  // Initialize form values when content changes
  useEffect(() => {
    form.setFieldsValue({
      primary_hotline: content?.primary_hotline || '',
      secondary_hotline: content?.secondary_hotline || '',
    });
  }, [content, form]);

  // Handle form value changes
  const handleValuesChange = (_: unknown, allValues: Record<string, string>) => {
    const newContent: BannerHeaderContentDraft = {
      logo_media_id: content?.logo_media_id, // Keep existing
      banner_media_id: content?.banner_media_id, // Keep existing
      primary_hotline: allValues.primary_hotline || undefined,
      secondary_hotline: allValues.secondary_hotline || undefined,
    };
    onChange(newContent);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
      onValuesChange={handleValuesChange}
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
            label="Company Logo"
            accept="image/png,image/jpeg,image/svg+xml"
            maxSizeMB={2}
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
            label="Header Banner Image"
            accept="image/*"
            maxSizeMB={5}
          />
        </div>

        {/* Hotlines Section */}
        <div>
          <Text strong>Hotline Numbers</Text>
          <Form.Item
            name="primary_hotline"
            label="Primary Hotline"
            style={{ marginTop: 8, marginBottom: 8 }}
            rules={[
              { pattern: /^[0-9\s\-()]+$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input
              placeholder="e.g., (0286) 271 3025"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="secondary_hotline"
            label="Secondary Hotline"
            style={{ marginBottom: 0 }}
            rules={[
              { pattern: /^[0-9\s\-()]+$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input
              placeholder="e.g., 0909 60 30 25"
              allowClear
            />
          </Form.Item>
        </div>
      </Space>
    </Form>
  );
}
