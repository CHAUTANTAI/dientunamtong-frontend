'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Radio, Button, Typography, Space } from 'antd';
import type { NewsSectionContent } from '@/types/pageSection';

const { Text } = Typography;

interface NewsSectionEditModalProps {
  open: boolean;
  onClose: () => void;
  content: NewsSectionContent;
  onSave: (content: NewsSectionContent) => void;
}

/**
 * NewsSectionEditModal
 * 
 * Allows admin to configure the News Section:
 * - Title
 * - Limit (number of news items to show)
 * - Mode: auto (fetch latest) or manual (select specific news)
 * - Display mode: grid or list
 * 
 * TODO: Add news selector for manual mode
 */
export default function NewsSectionEditModal({
  open,
  onClose,
  content,
  onSave,
}: NewsSectionEditModalProps) {
  const [form] = Form.useForm();
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    if (open) {
      const currentMode = content?.mode || 'auto';
      setMode(currentMode);
      
      form.setFieldsValue({
        title: content?.title || 'Tin tức xe',
        limit: content?.limit || 6,
        mode: currentMode,
        display_mode: content?.display_mode || 'grid',
        show_thumbnail: content?.show_thumbnail ?? true,
        show_excerpt: content?.show_excerpt ?? true,
      });
    }
  }, [open, content, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const newContent: NewsSectionContent = {
        title: values.title,
        limit: values.limit,
        mode: values.mode,
        news_ids: values.mode === 'manual' ? (content?.news_ids || []) : undefined,
        display_mode: values.display_mode,
        show_thumbnail: values.show_thumbnail,
        show_excerpt: values.show_excerpt,
      };

      onSave(newContent);
    });
  };

  return (
    <Modal
      title="Edit News Section"
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
          {/* Basic Settings */}
          <div>
            <Text strong>Basic Settings</Text>
            
            <Form.Item
              name="title"
              label="Section Title"
              style={{ marginTop: 8 }}
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="e.g., Tin tức xe" />
            </Form.Item>

            <Form.Item
              name="limit"
              label="Number of News Items"
              rules={[{ required: true, message: 'Please enter limit' }]}
            >
              <InputNumber
                min={1}
                max={50}
                style={{ width: '100%' }}
                placeholder="e.g., 6"
              />
            </Form.Item>
          </div>

          {/* Display Mode */}
          <div>
            <Text strong>Content Source</Text>
            
            <Form.Item
              name="mode"
              style={{ marginTop: 8 }}
            >
              <Radio.Group onChange={(e) => setMode(e.target.value)}>
                <Space direction="vertical">
                  <Radio value="auto">
                    <div>
                      <Text strong>Auto</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Automatically fetch latest news
                      </Text>
                    </div>
                  </Radio>
                  <Radio value="manual">
                    <div>
                      <Text strong>Manual</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Manually select specific news items (Coming Soon)
                      </Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Manual Mode Settings */}
          {mode === 'manual' && (
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Text type="secondary">
                TODO: Add news selector UI
                <br />
                Currently configured news items: {content?.news_ids?.length || 0}
              </Text>
            </div>
          )}

          {/* Layout Options */}
          <div>
            <Text strong>Layout Options</Text>
            
            <Form.Item
              name="display_mode"
              label="Display Mode"
              style={{ marginTop: 8 }}
            >
              <Radio.Group>
                <Radio value="grid">Grid Layout</Radio>
                <Radio value="list">List Layout</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="show_thumbnail"
              label="Show Thumbnail"
              valuePropName="checked"
            >
              <Radio.Group>
                <Radio value={true}>Show</Radio>
                <Radio value={false}>Hide</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="show_excerpt"
              label="Show Excerpt"
              valuePropName="checked"
            >
              <Radio.Group>
                <Radio value={true}>Show</Radio>
                <Radio value={false}>Hide</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Space>
      </Form>
    </Modal>
  );
}
