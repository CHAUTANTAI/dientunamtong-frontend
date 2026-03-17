'use client';

import { useEffect } from 'react';
import { Form, Input, InputNumber, Radio, Select, Space, Switch, Typography } from 'antd';
import type { NewsSectionContent } from '@/types/pageSection';

const { Text } = Typography;

interface NewsSectionFormProps {
  content: NewsSectionContent;
  onChange: (content: NewsSectionContent) => void;
  form: ReturnType<typeof Form.useForm<Record<string, unknown>>>[0];
}

/**
 * NewsSectionForm - Inline form for News Section configuration
 */
export default function NewsSectionForm({
  content,
  onChange,
  form,
}: NewsSectionFormProps) {
  
  useEffect(() => {
    form.setFieldsValue({
      title: content?.title || 'Tin tức xe',
      limit: content?.limit || 6,
      mode: content?.mode || 'auto',
      display_mode: content?.display_mode || 'grid',
      show_thumbnail: content?.show_thumbnail ?? true,
      show_excerpt: content?.show_excerpt ?? true,
    });
  }, [content, form]);

  const handleValuesChange = (_: unknown, allValues: Record<string, unknown>) => {
    const newContent: NewsSectionContent = {
      title: allValues.title as string || '',
      limit: allValues.limit as number || 6,
      mode: allValues.mode as 'auto' | 'manual' || 'auto',
      display_mode: allValues.display_mode as 'grid' | 'list' || 'grid',
      show_thumbnail: allValues.show_thumbnail as boolean ?? true,
      show_excerpt: allValues.show_excerpt as boolean ?? true,
    };
    onChange(newContent);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Form.Item
          name="title"
          label={<Text strong>Section Title</Text>}
          rules={[{ required: true, message: 'Title is required' }]}
          style={{ marginBottom: 0 }}
        >
          <Input placeholder="e.g., Tin tức xe" />
        </Form.Item>

        <Form.Item
          name="limit"
          label={<Text strong>Number of News Items</Text>}
          rules={[{ required: true, message: 'Limit is required' }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={1}
            max={50}
            style={{ width: '100%' }}
            placeholder="6"
          />
        </Form.Item>

        <Form.Item
          name="mode"
          label={<Text strong>Content Mode</Text>}
          style={{ marginBottom: 0 }}
        >
          <Radio.Group>
            <Radio value="auto">Auto (latest news)</Radio>
            <Radio value="manual" disabled>Manual selection (Coming soon)</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="display_mode"
          label={<Text strong>Display Layout</Text>}
          style={{ marginBottom: 0 }}
        >
          <Select>
            <Select.Option value="grid">Grid Layout</Select.Option>
            <Select.Option value="list">List Layout</Select.Option>
          </Select>
        </Form.Item>

        <div>
          <Text strong>Display Options</Text>
          <div style={{ marginTop: 8 }}>
            <Form.Item
              name="show_thumbnail"
              label="Show Thumbnail Image"
              valuePropName="checked"
              style={{ marginBottom: 8 }}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="show_excerpt"
              label="Show Excerpt/Summary"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </div>
        </div>
      </Space>
    </Form>
  );
}
