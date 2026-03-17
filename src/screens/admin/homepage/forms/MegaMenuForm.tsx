'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, List, Space, Typography, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined } from '@ant-design/icons';
import type { MegaMenuContent } from '@/types/pageSection';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;

interface MegaMenuFormProps {
  content: MegaMenuContent;
  onChange: (content: MegaMenuContent) => void;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  sort_order: number;
}

/**
 * MegaMenuForm - Inline form for managing Mega Menu items
 * No modal wrapper - used directly in Collapse panel
 */
export default function MegaMenuForm({ content, onChange }: MegaMenuFormProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setItems(content?.static_items || []);
  }, [content]);

  // Update parent whenever items change (avoid infinite loop by comparing stringified values)
  useEffect(() => {
    const currentItemsStr = JSON.stringify(items);
    const contentItemsStr = JSON.stringify(content?.static_items || []);
    
    if (currentItemsStr !== contentItemsStr) {
      onChange({ static_items: items });
    }
  }, [items, onChange]);

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

  const handleDeleteItem = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    const reordered = filtered.map((item, index) => ({ ...item, sort_order: index }));
    setItems(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    const reordered = newItems.map((item, idx) => ({ ...item, sort_order: idx }));
    setItems(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    const reordered = newItems.map((item, idx) => ({ ...item, sort_order: idx }));
    setItems(reordered);
  };

  const handleCancelForm = () => {
    form.resetFields();
    setEditingItem(null);
    setItemFormVisible(false);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* Add/Edit Form */}
      {itemFormVisible ? (
        <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="label"
              label="Menu Label"
              rules={[{ required: true, message: 'Please enter menu label' }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="e.g., Bảng giá" />
            </Form.Item>

            <Form.Item
              name="href"
              label="Link (href)"
              rules={[{ required: true, message: 'Please enter link' }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="e.g., /bang-gia" />
            </Form.Item>

            <Space>
              <Button 
                type="primary" 
                onClick={editingItem ? handleUpdateItem : handleAddItem}
              >
                {editingItem ? 'Update' : 'Add'}
              </Button>
              <Button onClick={handleCancelForm}>Cancel</Button>
            </Space>
          </Form>
        </Card>
      ) : (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setItemFormVisible(true)}
          block
        >
          Add Menu Item
        </Button>
      )}

      {/* Items List */}
      <List
        dataSource={items}
        locale={{ emptyText: 'No menu items. Click "Add Menu Item" to create one.' }}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Button
                key="up"
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => handleMoveUp(index)}
              />,
              <Button
                key="down"
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === items.length - 1}
                onClick={() => handleMoveDown(index)}
              />,
              <Button
                key="edit"
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditItem(item)}
              />,
              <Button
                key="delete"
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteItem(item.id)}
              />,
            ]}
          >
            <List.Item.Meta
              title={<Text strong>{item.label}</Text>}
              description={<Text type="secondary">{item.href}</Text>}
            />
          </List.Item>
        )}
        bordered
      />
    </Space>
  );
}
