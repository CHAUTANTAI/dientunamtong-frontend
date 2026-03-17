'use client';

import { useEffect } from 'react';
import { Form, Input, InputNumber, Radio, Select, Space, Typography } from 'antd';
import type { ProductsSectionContent } from '@/types/pageSection';

const { Text, Paragraph } = Typography;

interface ProductsSectionFormProps {
  content: ProductsSectionContent;
  onChange: (content: ProductsSectionContent) => void;
  form: ReturnType<typeof Form.useForm<Record<string, unknown>>>[0];
}

/**
 * ProductsSectionForm - Inline form for Products Section configuration
 */
export default function ProductsSectionForm({
  content,
  onChange,
  form,
}: ProductsSectionFormProps) {
  
  useEffect(() => {
    form.setFieldsValue({
      title: content?.title || 'Phụ tùng xe',
      limit: content?.limit || 6,
      mode: content?.mode || 'auto',
      filter_by: content?.filter_by || 'latest',
      show_price: content?.show_price ?? true,
    });
  }, [content, form]);

  const handleValuesChange = (_: unknown, allValues: Record<string, unknown>) => {
    const newContent: ProductsSectionContent = {
      title: allValues.title as string || '',
      limit: allValues.limit as number || 6,
      mode: allValues.mode as 'auto' | 'manual' || 'auto',
      filter_by: allValues.filter_by as 'latest' | 'most_viewed' | 'popular' | 'random',
      show_price: allValues.show_price as boolean ?? true,
    };
    onChange(newContent);
  };

  const mode = Form.useWatch('mode', form);

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Section Title */}
        <Form.Item
          name="title"
          label={<Text strong>Section Title</Text>}
          rules={[{ required: true, message: 'Title is required' }]}
          style={{ marginBottom: 0 }}
        >
          <Input placeholder="e.g., Phụ tùng xe" />
        </Form.Item>

        {/* Number of Products */}
        <Form.Item
          name="limit"
          label={<Text strong>Number of Products to Display</Text>}
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

        {/* Display Mode */}
        <Form.Item
          name="mode"
          label={<Text strong>Display Mode</Text>}
          style={{ marginBottom: 0 }}
        >
          <Radio.Group>
            <Radio value="auto">Auto (from database)</Radio>
            <Radio value="manual" disabled>Manual selection (Coming soon)</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Filter Options (Auto Mode) */}
        {mode === 'auto' && (
          <Form.Item
            name="filter_by"
            label={<Text strong>Filter By</Text>}
            style={{ marginBottom: 0 }}
          >
            <Select>
              <Select.Option value="latest">Latest Products</Select.Option>
              <Select.Option value="popular">Most Popular</Select.Option>
              <Select.Option value="featured">Featured Products</Select.Option>
            </Select>
          </Form.Item>
        )}

        {/* Show Price Toggle */}
        <Form.Item
          name="show_price"
          label={<Text strong>Show Price</Text>}
          valuePropName="checked"
          style={{ marginBottom: 0 }}
        >
          <Radio.Group>
            <Radio value={true}>Show</Radio>
            <Radio value={false}>Hide</Radio>
          </Radio.Group>
        </Form.Item>

        {mode === 'manual' && (
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            Manual product selection will be available in a future update.
          </Paragraph>
        )}
      </Space>
    </Form>
  );
}
