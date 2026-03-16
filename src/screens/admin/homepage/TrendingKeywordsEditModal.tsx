'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, List, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { TrendingKeywordsContent } from '@/types/pageSection';

const { Text } = Typography;

interface TrendingKeywordsEditModalProps {
  open: boolean;
  onClose: () => void;
  content: TrendingKeywordsContent;
  onSave: (content: TrendingKeywordsContent) => void;
}

export default function TrendingKeywordsEditModal({
  open,
  onClose,
  content,
  onSave,
}: TrendingKeywordsEditModalProps) {
  const [form] = Form.useForm();
  const [keywords, setKeywords] = useState(content?.keywords || []);

  useEffect(() => {
    if (open) {
      setKeywords(content?.keywords || []);
      form.setFieldsValue({
        title: content?.title || 'Xu hướng tìm kiếm:',
        show_icon: content?.show_icon ?? true,
        limit: content?.limit || undefined,
      });
    }
  }, [open, content, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const newContent: TrendingKeywordsContent = {
        title: values.title,
        show_icon: values.show_icon,
        limit: values.limit,
        keywords: keywords.map((kw, index) => ({
          ...kw,
          sort_order: index,
        })),
      };
      onSave(newContent);
    });
  };

  const addKeyword = () => {
    const newKeyword = {
      id: `temp_kw_${Date.now()}`,
      text: '',
      link: '#',
      sort_order: keywords.length,
    };
    setKeywords([...keywords, newKeyword]);
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const updateKeyword = (index: number, field: string, value: string) => {
    const updated = [...keywords];
    updated[index] = { ...updated[index], [field]: value };
    setKeywords(updated);
  };

  const moveKeyword = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === keywords.length - 1)
    ) {
      return;
    }

    const updated = [...keywords];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setKeywords(updated);
  };

  return (
    <Modal
      title="Edit Trending Keywords Section"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={800}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input placeholder="Xu hướng tìm kiếm:" />
        </Form.Item>

        <Space>
          <Form.Item label="Show Icon" name="show_icon" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Display Limit (optional)" name="limit">
            <InputNumber min={1} max={50} placeholder="All" />
          </Form.Item>
        </Space>

        <Text strong style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>
          Keywords
        </Text>
        <List
          dataSource={keywords}
          renderItem={(keyword, index) => (
            <List.Item
              actions={[
                <Button
                  key="up"
                  type="text"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => moveKeyword(index, 'up')}
                />,
                <Button
                  key="down"
                  type="text"
                  icon={<ArrowDownOutlined />}
                  disabled={index === keywords.length - 1}
                  onClick={() => moveKeyword(index, 'down')}
                />,
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeKeyword(index)}
                />,
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="Keyword text"
                  value={keyword.text}
                  onChange={(e) => updateKeyword(index, 'text', e.target.value)}
                />
                <Input
                  placeholder="Link URL"
                  value={keyword.link}
                  onChange={(e) => updateKeyword(index, 'link', e.target.value)}
                />
              </Space>
            </List.Item>
          )}
        />
        <Button
          type="dashed"
          onClick={addKeyword}
          icon={<PlusOutlined />}
          style={{ width: '100%', marginTop: 8 }}
        >
          Add Keyword
        </Button>
      </Form>
    </Modal>
  );
}
