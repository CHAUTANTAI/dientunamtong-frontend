'use client';

import { Modal, Button, Transfer, Form, Spin } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { LeftSidebarCategoriesContent } from '@/types/pageSection';
import type { Category } from '@/types/category';

interface LeftSidebarCategoriesEditModalProps {
  open: boolean;
  onClose: () => void;
  content: LeftSidebarCategoriesContent;
  onSave: (content: LeftSidebarCategoriesContent) => void;
}

const MAX_ITEMS = 8; // Fixed maximum items

export default function LeftSidebarCategoriesEditModal({
  open,
  onClose,
  content,
  onSave,
}: LeftSidebarCategoriesEditModalProps) {
  const t = useTranslations('homepageEditor.leftSidebarCategories.modal');
  const [form] = Form.useForm();
  const { data: categories, isLoading } = useGetCategoriesQuery();
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>(content?.category_ids || []);

  useEffect(() => {
    if (open) {
      setSelectedKeys(content?.category_ids || []);
    }
  }, [open, content]);

  const handleSubmit = () => {
    onSave({
      category_ids: selectedKeys,
      max_items: MAX_ITEMS,
    });
  };

  // Filter to show only root categories (no parent_id)
  const rootCategories = categories?.filter((cat: Category) => !cat.parent_id) || [];
  
  // Check if max items reached
  const isMaxReached = selectedKeys.length >= MAX_ITEMS;
  
  const dataSource = rootCategories.map((cat: Category) => ({
    key: cat.id,
    title: cat.name,
    disabled: isMaxReached && !selectedKeys.includes(cat.id), // Disable if max reached and not selected
  }));

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
          <Form.Item 
            label={t('categoriesLabel')}
            extra={
              <div>
                <div>Maximum {MAX_ITEMS} categories will be displayed on homepage</div>
                {isMaxReached && (
                  <div style={{ color: '#faad14', marginTop: 4 }}>
                    ⚠️ Maximum limit reached. Unselect an item to select another.
                  </div>
                )}
              </div>
            }
          >
            <Transfer
              dataSource={dataSource}
              titles={['Available', 'Selected']}
              targetKeys={selectedKeys}
              onChange={(targetKeys) => setSelectedKeys(targetKeys as string[])}
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
