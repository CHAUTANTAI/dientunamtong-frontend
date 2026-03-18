'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Typography, List, Card, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined } from '@ant-design/icons';
import type { RightSidebarContent } from '@/types/pageSection';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import MediaUpload, { type MediaValue } from '@/components/common/MediaUpload';
import { useDebounce } from '@/hooks/useDebounce';

const { Text, Title } = Typography;

interface RightSidebarFormProps {
  content: RightSidebarContent;
  onChange: (content: RightSidebarContent) => void;
}

interface NewsItem {
  id: string;
  title: string;
  link: string;
  date?: string;
  sort_order: number;
}

interface PromotionalBanner {
  id: string;
  media_id: MediaValue;
  link?: string;
  alt?: string;
  sort_order: number;
}

/**
 * RightSidebarForm - Inline form for Right Sidebar news items
 */
export default function RightSidebarForm({ content, onChange }: RightSidebarFormProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [promotionalBanners, setPromotionalBanners] = useState<PromotionalBanner[]>([]);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [form] = Form.useForm();

  // Debounce to avoid rapid onChange calls
  const debouncedNewsItems = useDebounce(newsItems, 500);
  const debouncedPromotionalBanners = useDebounce(promotionalBanners, 500);

  useEffect(() => {
    setNewsItems(content?.news_items || []);
    setPromotionalBanners(content?.promotional_banners || []);
  }, [content]);

  useEffect(() => {
    // Avoid infinite loop with deep comparison
    const currentState = JSON.stringify({ newsItems: debouncedNewsItems, promotionalBanners: debouncedPromotionalBanners });
    const contentState = JSON.stringify({
      newsItems: content?.news_items || [],
      promotionalBanners: content?.promotional_banners || [],
    });
    
    if (currentState !== contentState) {
      onChange({
        news_items: debouncedNewsItems,
        promotional_banners: debouncedPromotionalBanners as unknown as RightSidebarContent['promotional_banners'],
      });
    }
  }, [debouncedNewsItems, debouncedPromotionalBanners, onChange]);

  const handleAddItem = () => {
    form.validateFields().then((values) => {
      const newItem: NewsItem = {
        id: uuidv4(),
        title: values.title,
        link: values.link,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
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
      date: item.date ? dayjs(item.date) : null,
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
              date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
            }
          : item
      );
      setNewsItems(updatedItems);
      form.resetFields();
      setEditingItem(null);
      setItemFormVisible(false);
    });
  };

  const handleDeleteItem = (id: string) => {
    const filtered = newsItems.filter(item => item.id !== id);
    const reordered = filtered.map((item, index) => ({ ...item, sort_order: index }));
    setNewsItems(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...newsItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    const reordered = newItems.map((item, idx) => ({ ...item, sort_order: idx }));
    setNewsItems(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === newsItems.length - 1) return;
    const newItems = [...newsItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    const reordered = newItems.map((item, idx) => ({ ...item, sort_order: idx }));
    setNewsItems(reordered);
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
              name="title"
              label="News Title"
              rules={[{ required: true, message: 'Title is required' }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="e.g., ADV 160 nâng cấp màn hình..." />
            </Form.Item>

            <Form.Item
              name="link"
              label="Link URL"
              rules={[{ required: true, message: 'Link is required' }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="/news/article-slug or https://..." />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date (optional)"
              style={{ marginBottom: 12 }}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
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
          Add News Item
        </Button>
      )}

      {/* News Items List */}
      <div>
        <Text strong>News Items ({newsItems.length})</Text>
        <List
          dataSource={newsItems}
          locale={{ emptyText: 'No news items. Click "Add News Item" to create one.' }}
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
                  disabled={index === newsItems.length - 1}
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
                title={<Text strong>{item.title}</Text>}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.link}</Text>
                    {item.date && <Text type="secondary" style={{ fontSize: 12 }}>📅 {item.date}</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
          bordered
          style={{ marginTop: 8 }}
        />
      </div>

      {/* TODO: Promotional Banners */}
      <div>
        <Space style={{ marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0 }}>Promotional Banners</Title>
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setPromotionalBanners([
                ...promotionalBanners,
                {
                  id: uuidv4(),
                  media_id: '',
                  link: '#',
                  alt: `Banner ${promotionalBanners.length + 1}`,
                  sort_order: promotionalBanners.length,
                },
              ]);
            }}
          >
            Add Banner
          </Button>
        </Space>

        {promotionalBanners.length === 0 ? (
          <Text type="secondary">No banners yet. Click "Add Banner" to create one.</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {promotionalBanners.map((banner, index) => (
              <Card key={banner.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <MediaUpload
                    value={banner.media_id}
                    onChange={(path) => {
                      const updated = [...promotionalBanners];
                      updated[index].media_id = path;
                      setPromotionalBanners(updated);
                    }}
                    folder="homepage/promotional-banners"
                    label={`Banner ${index + 1}`}
                    accept="image/*"
                    maxSizeMB={5}
                  />
                  <Input
                    placeholder="Link URL"
                    value={banner.link}
                    onChange={(e) => {
                      const updated = [...promotionalBanners];
                      updated[index].link = e.target.value;
                      setPromotionalBanners(updated);
                    }}
                    addonBefore="Link"
                  />
                  <Input
                    placeholder="Alt text"
                    value={banner.alt}
                    onChange={(e) => {
                      const updated = [...promotionalBanners];
                      updated[index].alt = e.target.value;
                      setPromotionalBanners(updated);
                    }}
                    addonBefore="Alt"
                  />
                  <Space>
                    <Button
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => {
                        const newBanners = [...promotionalBanners];
                        [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
                        const reordered = newBanners.map((b, idx) => ({ ...b, sort_order: idx }));
                        setPromotionalBanners(reordered);
                      }}
                    />
                    <Button
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={index === promotionalBanners.length - 1}
                      onClick={() => {
                        const newBanners = [...promotionalBanners];
                        [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
                        const reordered = newBanners.map((b, idx) => ({ ...b, sort_order: idx }));
                        setPromotionalBanners(reordered);
                      }}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        const filtered = promotionalBanners.filter((_, i) => i !== index);
                        const reordered = filtered.map((b, idx) => ({ ...b, sort_order: idx }));
                        setPromotionalBanners(reordered);
                      }}
                    >
                      Remove
                    </Button>
                  </Space>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </Space>
  );
}
