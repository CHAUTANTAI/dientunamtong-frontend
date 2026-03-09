'use client';

import { Modal, Button, Transfer, InputNumber, Form, Spin } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { LeftSidebarCategoriesContent } from '@/types/pageSection';

interface LeftSidebarCategoriesEditModalProps {
  open: boolean;
  onClose: () => void;
  content: LeftSidebarCategoriesContent;
  onSave: (content: LeftSidebarCategoriesContent) => void;
}

export default function LeftSidebarCategoriesEditModal({
  open,
  onClose,
  content,
  onSave,
}: LeftSidebarCategoriesEditModalProps) {
  const t = useTranslations('homepageEditor.leftSidebarCategories.modal');
  const [form] = Form.useForm();
  const { data: categories, isLoading } = useGetCategoriesQuery({});
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>(content?.category_ids || []);
  const [maxItems, setMaxItems] = useState<number>(content?.max_items || 8);

  useEffect(() => {
    if (open) {
      setSelectedKeys(content?.category_ids || []);
      setMaxItems(content?.max_items || 8);
    }
  }, [open, content]);

  const handleSubmit = () => {
    onSave({
      category_ids: selectedKeys,
      max_items: maxItems,
    });
  };

  const dataSource = categories?.items?.map((cat: any) => ({
    key: cat.id,
    title: cat.name,
  })) || [];

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
          OK
        </Button>,
      ]}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item label={t('maxItemsLabel')}>
            <InputNumber
              min={1}
              max={20}
              value={maxItems}
              onChange={(val) => setMaxItems(val || 8)}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label={t('categoriesLabel')}>
            <Transfer
              dataSource={dataSource}
              titles={['Available', 'Selected']}
              targetKeys={selectedKeys}
              onChange={setSelectedKeys}
              render={(item) => item.title}
              listStyle={{
                width: 300,
                height: 400,
              }}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
