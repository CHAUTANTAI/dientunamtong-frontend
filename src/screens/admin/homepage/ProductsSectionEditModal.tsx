'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Radio, Button, Typography, Space } from 'antd';
import type { ProductsSectionContent } from '@/types/pageSection';

const { Text } = Typography;

interface ProductsSectionEditModalProps {
  open: boolean;
  onClose: () => void;
  content: ProductsSectionContent;
  onSave: (content: ProductsSectionContent) => void;
}

/**
 * ProductsSectionEditModal
 * 
 * Allows admin to configure the Products Section:
 * - Title
 * - Limit (number of products to show)
 * - Mode: auto (fetch latest/popular) or manual (select specific products)
 * - Filter by: latest, most_viewed, popular, random (for auto mode)
 * 
 * TODO: Add product selector for manual mode
 */
export default function ProductsSectionEditModal({
  open,
  onClose,
  content,
  onSave,
}: ProductsSectionEditModalProps) {
  const [form] = Form.useForm();
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    if (open) {
      const currentMode = content?.mode || 'auto';
      setMode(currentMode);
      
      form.setFieldsValue({
        title: content?.title || 'Phụ tùng xe',
        limit: content?.limit || 6,
        mode: currentMode,
        filter_by: content?.filter_by || 'latest',
        show_price: content?.show_price ?? true,
      });
    }
  }, [open, content, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const newContent: ProductsSectionContent = {
        title: values.title,
        limit: values.limit,
        mode: values.mode,
        filter_by: values.mode === 'auto' ? values.filter_by : undefined,
        product_ids: values.mode === 'manual' ? (content?.product_ids || []) : undefined,
        show_price: values.show_price,
        layout: 'grid',
      };

      onSave(newContent);
    });
  };

  return (
    <Modal
      title="Edit Products Section"
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
              <Input placeholder="e.g., Phụ tùng xe" />
            </Form.Item>

            <Form.Item
              name="limit"
              label="Number of Products"
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
            <Text strong>Display Mode</Text>
            
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
                        Automatically fetch products based on filter
                      </Text>
                    </div>
                  </Radio>
                  <Radio value="manual">
                    <div>
                      <Text strong>Manual</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Manually select specific products (Coming Soon)
                      </Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Auto Mode Settings */}
          {mode === 'auto' && (
            <div>
              <Text strong>Filter By</Text>
              
              <Form.Item
                name="filter_by"
                style={{ marginTop: 8 }}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="latest">Latest Products</Radio>
                    <Radio value="most_viewed">Most Viewed</Radio>
                    <Radio value="popular">Popular</Radio>
                    <Radio value="random">Random</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>
          )}

          {/* Manual Mode Settings */}
          {mode === 'manual' && (
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Text type="secondary">
                TODO: Add product selector UI
                <br />
                Currently configured products: {content?.product_ids?.length || 0}
              </Text>
            </div>
          )}

          {/* Display Options */}
          <div>
            <Text strong>Display Options</Text>
            
            <Form.Item
              name="show_price"
              valuePropName="checked"
              style={{ marginTop: 8 }}
            >
              <Radio.Group>
                <Radio value={true}>Show Price</Radio>
                <Radio value={false}>Hide Price</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Space>
      </Form>
    </Modal>
  );
}
