'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Radio, Button, Typography, Space } from 'antd';
import type { LeftSidebarContent } from '@/types/pageSection';

const { Text } = Typography;

interface LeftSidebarEditModalProps {
  open: boolean;
  onClose: () => void;
  content: LeftSidebarContent;
  onSave: (content: LeftSidebarContent) => void;
}

/**
 * LeftSidebarEditModal
 * 
 * Allows admin to configure the Left Sidebar:
 * - Show all categories from DB (auto mode)
 * - Max items to display
 * 
 * Note: Categories are automatically fetched from database
 * This modal only controls display settings
 */
export default function LeftSidebarEditModal({
  open,
  onClose,
  content,
  onSave,
}: LeftSidebarEditModalProps) {
  const [form] = Form.useForm();
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    if (open) {
      const currentShowAll = content?.show_all ?? true;
      setShowAll(currentShowAll);
      
      form.setFieldsValue({
        show_all: currentShowAll,
        max_items: content?.max_items || 8,
      });
    }
  }, [open, content, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const newContent: LeftSidebarContent = {
        show_all: values.show_all,
        max_items: values.show_all ? undefined : values.max_items,
        category_ids: undefined, // Not used in auto mode
      };

      onSave(newContent);
    });
  };

  return (
    <Modal
      title="Edit Left Sidebar"
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
          {/* Display Mode */}
          <div>
            <Text strong>Display Mode</Text>
            
            <Form.Item
              name="show_all"
              style={{ marginTop: 8 }}
            >
              <Radio.Group onChange={(e) => setShowAll(e.target.value)}>
                <Space direction="vertical">
                  <Radio value={true}>
                    <div>
                      <Text strong>Show All Categories</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Display all categories from database
                      </Text>
                    </div>
                  </Radio>
                  <Radio value={false}>
                    <div>
                      <Text strong>Limit Display</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Show only a specific number of categories
                      </Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Max Items Setting */}
          {!showAll && (
            <div>
              <Text strong>Display Limit</Text>
              
              <Form.Item
                name="max_items"
                label="Maximum Categories"
                style={{ marginTop: 8 }}
                rules={[{ required: true, message: 'Please enter max items' }]}
              >
                <InputNumber
                  min={1}
                  max={50}
                  style={{ width: '100%' }}
                  placeholder="e.g., 8"
                />
              </Form.Item>
            </div>
          )}

          {/* Info Box */}
          <div style={{ padding: 16, background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 8 }}>
            <Text>
              <strong>Note:</strong> Categories are automatically fetched from your database. 
              The category tree structure and subcategories are managed in the Categories section.
            </Text>
          </div>
        </Space>
      </Form>
    </Modal>
  );
}
