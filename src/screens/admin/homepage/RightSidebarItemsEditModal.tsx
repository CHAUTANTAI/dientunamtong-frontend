'use client';

import { Modal, Button, Form, Input, List, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { RightSidebarItemsContent } from '@/types/pageSection';

const { Text } = Typography;

interface RightSidebarItemsEditModalProps {
  open: boolean;
  onClose: () => void;
  content: RightSidebarItemsContent;
  onSave: (content: RightSidebarItemsContent) => void;
}

interface SidebarItem {
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
  icon?: string;
}

export default function RightSidebarItemsEditModal({
  open,
  onClose,
  content,
  onSave,
}: RightSidebarItemsEditModalProps) {
  const t = useTranslations('homepageEditor.rightSidebarItems.modal');
  const [form] = Form.useForm();
  
  const [items, setItems] = useState<SidebarItem[]>(content?.items || []);
  const [editingItem, setEditingItem] = useState<SidebarItem | null>(null);
  const [itemFormVisible, setItemFormVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setItems(content?.items || []);
      setEditingItem(null);
      setItemFormVisible(false);
    }
  }, [open, content]);

  const handleAddItem = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        // Update existing item
        setItems(items.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...values }
            : item
        ));
      } else {
        // Add new item
        const newItem: SidebarItem = {
          id: Date.now().toString(),
          ...values,
        };
        setItems([...items, newItem]);
      }
      
      form.resetFields();
      setEditingItem(null);
      setItemFormVisible(false);
    });
  };

  const handleEditItem = (item: SidebarItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setItemFormVisible(true);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    onSave({ items });
  };

  return (
    <Modal
      title={t('title')}
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit}>
          Save
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Add/Edit Item Form */}
        {itemFormVisible ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddItem}
          >
            <Form.Item
              label={t('itemTitleLabel')}
              name="title"
              rules={[{ required: true, message: t('itemTitleRequired') }]}
            >
              <Input placeholder={t('itemTitlePlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('itemSubtitleLabel')}
              name="subtitle"
            >
              <Input placeholder={t('itemSubtitlePlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('itemLinkLabel')}
              name="link"
            >
              <Input placeholder={t('itemLinkPlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('itemIconLabel')}
              name="icon"
            >
              <Input placeholder={t('itemIconPlaceholder')} />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setItemFormVisible(false);
                setEditingItem(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form>
        ) : (
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setItemFormVisible(true)}
          >
            {t('addItemButton')}
          </Button>
        )}

        {/* Items List */}
        <List
          dataSource={items}
          locale={{ emptyText: t('emptyText') }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditItem(item)}
                />,
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
                title={
                  <Space>
                    {item.icon && <span>{item.icon}</span>}
                    <Text strong>{item.title}</Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    {item.subtitle && <Text type="secondary">{item.subtitle}</Text>}
                    {item.link && <Text type="secondary" code>{item.link}</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Modal>
  );
}
