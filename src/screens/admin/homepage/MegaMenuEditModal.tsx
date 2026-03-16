'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, List, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { MegaMenuContent } from '@/types/pageSection';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;

interface MegaMenuEditModalProps {
  open: boolean;
  onClose: () => void;
  content: MegaMenuContent;
  onSave: (content: MegaMenuContent) => void;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  sort_order: number;
}

/**
 * MegaMenuEditModal
 * 
 * Allows admin to manage static menu items (e.g., "Bảng giá", "Tem xe", "Video")
 * - Add/Remove menu items
 * - Reorder items (up/down)
 * - Edit label and href for each item
 */
export default function MegaMenuEditModal({
  open,
  onClose,
  content,
  onSave,
}: MegaMenuEditModalProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      setItems(content?.static_items || []);
      setEditingItem(null);
      setItemFormVisible(false);
    }
  }, [open, content]);

  const handleAddItem = () => {
    form.validateFields().then((values) => {
      const newItem: MenuItem = {
        id: uuidv4(),
        label: values.label,
        href: values.href,
        sort_order: items.length,
      };

      setItems([...items, newItem]);
      form.resetFields();
      setItemFormVisible(false);
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      label: item.label,
      href: item.href,
    });
    setItemFormVisible(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    form.validateFields().then((values) => {
      const updatedItems = items.map(item =>
        item.id === editingItem.id
          ? { ...item, label: values.label, href: values.href }
          : item
      );

      setItems(updatedItems);
      form.resetFields();
      setEditingItem(null);
      setItemFormVisible(false);
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const filteredItems = items.filter(item => item.id !== itemId);
    // Re-index sort_order
    const reindexed = filteredItems.map((item, index) => ({
      ...item,
      sort_order: index,
    }));
    setItems(reindexed);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    // Update sort_order
    newItems.forEach((item, idx) => {
      item.sort_order = idx;
    });
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    // Update sort_order
    newItems.forEach((item, idx) => {
      item.sort_order = idx;
    });
    setItems(newItems);
  };

  const handleSave = () => {
    const newContent: MegaMenuContent = {
      static_items: items,
    };
    onSave(newContent);
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingItem(null);
    setItemFormVisible(false);
  };

  return (
    <Modal
      title="Edit Mega Menu Items"
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Menu Items List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong>Menu Items ({items.length})</Text>
            {!itemFormVisible && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setEditingItem(null);
                  setItemFormVisible(true);
                }}
              >
                Add Item
              </Button>
            )}
          </div>

          {/* Add/Edit Form */}
          {itemFormVisible && (
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 16 }}>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="label"
                  label="Label"
                  rules={[{ required: true, message: 'Please enter label' }]}
                >
                  <Input placeholder="e.g., Bảng giá" />
                </Form.Item>

                <Form.Item
                  name="href"
                  label="Link (href)"
                  rules={[{ required: true, message: 'Please enter link' }]}
                >
                  <Input placeholder="e.g., /pricing or #" />
                </Form.Item>

                <Space>
                  <Button
                    type="primary"
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                  >
                    {editingItem ? 'Update' : 'Add'}
                  </Button>
                  <Button onClick={handleCancel}>
                    Cancel
                  </Button>
                </Space>
              </Form>
            </div>
          )}

          {/* Items List */}
          {items.length > 0 ? (
            <List
              dataSource={items}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button
                      key="up"
                      type="text"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                    />,
                    <Button
                      key="down"
                      type="text"
                      icon={<ArrowDownOutlined />}
                      disabled={index === items.length - 1}
                      onClick={() => handleMoveDown(index)}
                    />,
                    <Button
                      key="edit"
                      type="link"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </Button>,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteItem(item.id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.label}
                    description={`Link: ${item.href}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">No menu items yet. Click "Add Item" to start.</Text>
          )}
        </div>
      </Space>
    </Modal>
  );
}
