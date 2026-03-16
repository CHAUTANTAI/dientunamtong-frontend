'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Space, message } from 'antd';
import type { BannerHeaderContent } from '@/types/pageSection';

const { Text } = Typography;

interface BannerHeaderEditModalProps {
  open: boolean;
  onClose: () => void;
  content: BannerHeaderContent;
  onSave: (content: BannerHeaderContent) => void;
}

/**
 * BannerHeaderEditModal
 * 
 * Allows admin to edit:
 * - Logo media ID (company logo)
 * - Banner media ID (header banner image)
 * - Primary hotline (main phone number)
 * - Secondary hotline (secondary phone number)
 * 
 * TODO: Add media upload/selection functionality
 */
export default function BannerHeaderEditModal({
  open,
  onClose,
  content,
  onSave,
}: BannerHeaderEditModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        logo_media_id: content?.logo_media_id || '',
        banner_media_id: content?.banner_media_id || '',
        primary_hotline: content?.primary_hotline || '',
        secondary_hotline: content?.secondary_hotline || '',
      });
    }
  }, [open, content, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const newContent: BannerHeaderContent = {
        logo_media_id: values.logo_media_id || undefined,
        banner_media_id: values.banner_media_id || undefined,
        primary_hotline: values.primary_hotline || undefined,
        secondary_hotline: values.secondary_hotline || undefined,
      };

      onSave(newContent);
    }).catch((errorInfo) => {
      console.error('Validation failed:', errorInfo);
      message.error('Please check all required fields');
    });
  };

  return (
    <Modal
      title="Edit Banner Header"
      open={open}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Logo Section */}
          <div>
            <Text strong>Company Logo</Text>
            <Form.Item
              name="logo_media_id"
              style={{ marginTop: 8 }}
              help="TODO: Add media upload/selection. Currently accepts media ID."
            >
              <Input
                placeholder="Enter logo media ID (optional)"
                allowClear
              />
            </Form.Item>
          </div>

          {/* Banner Section */}
          <div>
            <Text strong>Header Banner Image</Text>
            <Form.Item
              name="banner_media_id"
              style={{ marginTop: 8 }}
              help="TODO: Add media upload/selection. Currently accepts media ID."
            >
              <Input
                placeholder="Enter banner media ID (optional)"
                allowClear
              />
            </Form.Item>
          </div>

          {/* Hotlines Section */}
          <div>
            <Text strong>Hotline Numbers</Text>
            <Form.Item
              name="primary_hotline"
              label="Primary Hotline"
              style={{ marginTop: 8 }}
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
    </Modal>
  );
}
