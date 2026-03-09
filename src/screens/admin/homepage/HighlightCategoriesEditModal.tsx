'use client';

import { Modal, Button, Form, Input, List, Space, Typography, Select, Spin, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { HighlightCategoriesContent } from '@/types/pageSection';

const { Text } = Typography;

interface HighlightCategoriesEditModalProps {
  open: boolean;
  onClose: () => void;
  content: HighlightCategoriesContent;
  onSave: (content: HighlightCategoriesContent) => void;
}

interface CategoryConfig {
  category_id: string;
  sub_category_ids: string[];
}

export default function HighlightCategoriesEditModal({
  open,
  onClose,
  content,
  onSave,
}: HighlightCategoriesEditModalProps) {
  const t = useTranslations('homepageEditor.highlightCategories.modal');
  const [form] = Form.useForm();
  const { data: allCategories, isLoading } = useGetCategoriesQuery({});
  
  const [title, setTitle] = useState(content?.title || 'Highlight Categories');
  const [limit, setLimit] = useState(content?.limit || 3);
  const [categories, setCategories] = useState<CategoryConfig[]>(content?.categories || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [categoryFormVisible, setCategoryFormVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(content?.title || 'Highlight Categories');
      setLimit(content?.limit || 3);
      setCategories(content?.categories || []);
      setEditingIndex(null);
      setCategoryFormVisible(false);
    }
  }, [open, content]);

  const handleAddCategory = () => {
    form.validateFields().then((values) => {
      const newCategory: CategoryConfig = {
        category_id: values.category_id,
        sub_category_ids: values.sub_category_ids || [],
      };

      if (editingIndex !== null) {
        // Update existing category
        const updated = [...categories];
        updated[editingIndex] = newCategory;
        setCategories(updated);
      } else {
        // Add new category
        setCategories([...categories, newCategory]);
      }
      
      form.resetFields();
      setEditingIndex(null);
      setCategoryFormVisible(false);
    });
  };

  const handleEditCategory = (index: number) => {
    setEditingIndex(index);
    const cat = categories[index];
    form.setFieldsValue(cat);
    setCategoryFormVisible(true);
  };

  const handleDeleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSave({
      title,
      limit,
      categories,
    });
  };

  // Get root categories (parent_id is null)
  const rootCategories = allCategories?.items?.filter((cat: any) => !cat.parent_id) || [];
  
  // Get sub-categories for selected parent
  const selectedParentId = Form.useWatch('category_id', form);
  const subCategories = allCategories?.items?.filter((cat: any) => cat.parent_id === selectedParentId) || [];

  const getCategoryName = (id: string) => {
    return allCategories?.items?.find((cat: any) => cat.id === id)?.name || id;
  };

  return (
    <Modal
      title={t('title')}
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit}>
          Save
        </Button>,
      ]}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Section Title */}
          <Form.Item label={t('sectionTitleLabel')}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('sectionTitlePlaceholder')}
            />
          </Form.Item>

          {/* Limit */}
          <Form.Item label={t('limitLabel')}>
            <InputNumber
              min={1}
              max={10}
              value={limit}
              onChange={(val) => setLimit(val || 3)}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Add/Edit Category Form */}
          {categoryFormVisible ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddCategory}
            >
              <Form.Item
                label={t('parentCategoryLabel')}
                name="category_id"
                rules={[{ required: true, message: t('parentCategoryRequired') }]}
              >
                <Select
                  placeholder={t('parentCategoryPlaceholder')}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={rootCategories.map((cat: any) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label={t('subCategoriesLabel')}
                name="sub_category_ids"
              >
                <Select
                  mode="multiple"
                  placeholder={t('subCategoriesPlaceholder')}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={subCategories.map((cat: any) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  disabled={!selectedParentId}
                />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit">
                  {editingIndex !== null ? 'Update' : 'Add'}
                </Button>
                <Button onClick={() => {
                  setCategoryFormVisible(false);
                  setEditingIndex(null);
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
              onClick={() => setCategoryFormVisible(true)}
            >
              {t('addCategoryButton')}
            </Button>
          )}

          {/* Categories List */}
          <List
            dataSource={categories}
            locale={{ emptyText: t('emptyText') }}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditCategory(index)}
                  />,
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCategory(index)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{getCategoryName(item.category_id)}</Text>}
                  description={
                    item.sub_category_ids.length > 0 ? (
                      <Text type="secondary">
                        {item.sub_category_ids.length} sub-category(ies): {item.sub_category_ids.map(id => getCategoryName(id)).join(', ')}
                      </Text>
                    ) : (
                      <Text type="secondary">No sub-categories</Text>
                    )
                  }
                />
              </List.Item>
            )}
          />
        </Space>
      )}
    </Modal>
  );
}
