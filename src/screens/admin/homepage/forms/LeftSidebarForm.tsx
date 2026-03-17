'use client';

import { useEffect } from 'react';
import { Form, InputNumber, Radio, Typography, Space } from 'antd';
import type { LeftSidebarContent } from '@/types/pageSection';

const { Text, Paragraph } = Typography;

interface LeftSidebarFormProps {
  content: LeftSidebarContent;
  onChange: (content: LeftSidebarContent) => void;
  form: ReturnType<typeof Form.useForm<Record<string, unknown>>>[0];
}

/**
 * LeftSidebarForm - Inline form for Left Sidebar configuration
 */
export default function LeftSidebarForm({
  content,
  onChange,
  form,
}: LeftSidebarFormProps) {
  
  useEffect(() => {
    form.setFieldsValue({
      show_all: content?.show_all ?? true,
      max_items: content?.max_items || 8,
    });
  }, [content, form]);

  const handleValuesChange = (_: unknown, allValues: Record<string, unknown>) => {
    const newContent: LeftSidebarContent = {
      show_all: allValues.show_all as boolean ?? true,
      max_items: allValues.max_items as number || 8,
      category_ids: content?.category_ids,
    };
    onChange(newContent);
  };

  const showAll = Form.useWatch('show_all', form);

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Paragraph type="secondary">
          The Left Sidebar displays product categories in a collapsible menu. Categories are automatically fetched from the database.
        </Paragraph>

        {/* Display Mode */}
        <Form.Item
          name="show_all"
          label={<Text strong>Display Mode</Text>}
          style={{ marginBottom: 0 }}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value={true}>Show All Categories</Radio>
              <Radio value={false}>Limit Display</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {/* Max Items (only if not showing all) */}
        {!showAll && (
          <Form.Item
            name="max_items"
            label={<Text strong>Maximum Categories to Display</Text>}
            rules={[{ required: true, message: 'Max items is required' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              min={1}
              max={50}
              style={{ width: '100%' }}
              placeholder="8"
            />
          </Form.Item>
        )}

        <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
          Note: Categories with parent-child relationships will display in a nested structure automatically.
        </Paragraph>
      </Space>
    </Form>
  );
}
