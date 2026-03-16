'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, List, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { RightSidebarContent } from '@/types/pageSection';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;

interface RightSidebarEditModalProps {
  open: boolean;
  onClose: () => void;
  content: RightSidebarContent;
  onSave: (content: RightSidebarContent) => void;
}

interface NewsItem {
  id: string;
  title: string;
  link: string;
  date?: string;
  sort_order: number;
}

/**
 * RightSidebarEditModal
 * 
 * Allows admin to manage Right Sidebar content:
 * - News items list (add/edit/delete/reorder)
 * - Promotional banners (TODO)
 */
export default function RightSidebarEditModal({
  open,
  onClose,
  content,
  onSave,
}: RightSidebarEditModalProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      setNewsItems(content?.news_items || []);
      setEditingItem(null);
      setItemFormVisible(false);
    }
  }, [open, content]);

  const handleAddItem = () => {
    form.validateFields().then((values) => {
      const newItem: NewsItem = {
        id: uuidv4(),
        title: values.title,
        link: values.link,
        date: values.date || undefined,
        sort_order: newsItems.length,
      };

      setNewsItems([...newsItems, newItem]);
      form.resetFields();
      setItemFormVisible(false);
    });
  };

  const handleEditItem = (item: NewsItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      link: item.link,
      date: item.date || '',
    });
    setItemFormVisible(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    form.validateFields().then((values) => {
      const updatedItems = newsItems.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              title: values.title,
              link: values.link,
              date: values.date || undefined,
            }
          : item
      );

      setNewsItems(updatedItems);
      form.resetFields();
      setEditingItem(null);
      setItemFormVisible(false);
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const filteredItems = newsItems.filter(item => item.id !== itemId);
    // Re-index sort_order
    const reindexed = filteredItems.map((item, index) => ({
      ...item,
      sort_order: index,
    }));
    setNewsItems(reindexed);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...newsItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    // Update sort_order
    newItems.forEach((item, idx) => {
      item.sort_order = idx;
    });
    setNewsItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === newsItems.length - 1) return;
    const newItems = [...newsItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    // Update sort_order
    newItems.forEach((item, idx) => {
      item.sort_order = idx;
    });
    setNewsItems(newItems);
  };

  const handleSave = () => {
    const newContent: RightSidebarContent = {
      news_items: newsItems,
      promotional_banners: content?.promotional_banners || [],
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
      title="Edit Right Sidebar"
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
        {/* News Items */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong>News Items ({newsItems.length})</Text>
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
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: 'Please enter title' }]}
                >
                  <Input placeholder="e.g., New product release" />
                </Form.Item>

                <Form.Item
                  name="link"
                  label="Link"
                  rules={[{ required: true, message: 'Please enter link' }]}
                >
                  <Input placeholder="e.g., /news/product-release or https://..." />
                </Form.Item>

                <Form.Item
                  name="date"
                  label="Date (Optional)"
                >
                  <Input placeholder="e.g., 15/03/2026" />
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
          {newsItems.length > 0 ? (
            <List
              dataSource={newsItems}
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
                      disabled={index === newsItems.length - 1}
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
                    title={item.title}
                    description={
                      <Space direction="vertical" size={4}>
                        <Text type="secondary">Link: {item.link}</Text>
                        {item.date && <Text type="secondary">Date: {item.date}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">No news items yet. Click "Add Item" to start.</Text>
          )}
        </div>

        {/* Promotional Banners - Coming Soon */}
        <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Text strong>Promotional Banners</Text>
          <br />
          <Text type="secondary">
            TODO: Add banner management UI
            <br />
            Currently configured banners: {content?.promotional_banners?.length || 0}
          </Text>
        </div>
      </Space>
    </Modal>
  );
}
