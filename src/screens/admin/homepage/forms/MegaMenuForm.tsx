'use client';

import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, List, Space, Typography, Card, Radio, TreeSelect, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined, LinkOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { MegaMenuContent } from '@/types/pageSection';
import { v4 as uuidv4 } from 'uuid';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useTranslations } from 'next-intl';

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
  source?: 'manual' | 'category'; // Track source type
  category_id?: string; // Store category ID if from category
}

/**
 * MegaMenuForm - Inline form for managing Mega Menu items
 * Supports 2 methods: Manual entry or selecting from categories
 */
export default function MegaMenuForm({ content, onChange }: MegaMenuFormProps) {
  const t = useTranslations('homepageEditor.forms.megaMenu');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemFormVisible, setItemFormVisible] = useState(false);
  const [addMethod, setAddMethod] = useState<'manual' | 'category'>('category'); // Default to category
  const [form] = Form.useForm();
  const isInitializingRef = useRef(true);

  // Fetch categories for selection
  const { data: categories, isLoading: categoriesLoading } = useGetPublicCategoriesQuery();

  // Convert flat categories to tree structure for TreeSelect
  const buildCategoryTree = () => {
    if (!categories) return [];

    interface TreeNode {
      value: string;
      title: string;
      children?: TreeNode[];
    }

    // Build tree structure
    const categoryMap = new Map<string, TreeNode>();
    const rootCategories: TreeNode[] = [];

    // First pass: create nodes
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        value: cat.id,
        title: cat.name,
        children: [],
      });
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
      const node = categoryMap.get(cat.id);
      if (node && cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        } else {
          rootCategories.push(node);
        }
      } else if (node) {
        rootCategories.push(node);
      }
    });

    // Remove empty children arrays
    const cleanTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => ({
        ...node,
        children: node.children && node.children.length > 0 ? cleanTree(node.children) : undefined,
      }));
    };

    return cleanTree(rootCategories);
  };

  const categoryTreeData = buildCategoryTree();

  // Sync from props on mount/when static_items change - use deep comparison
  useEffect(() => {
    const newItems = content?.static_items || [];
    // Only update if content actually changed (not just reference)
    const itemsChanged = JSON.stringify(items) !== JSON.stringify(newItems);
    if (itemsChanged) {
      console.log('🔄 MegaMenuForm sync from props - items:', newItems.length);
      setItems(newItems);
      isInitializingRef.current = true;
    }
  }, [content?.static_items]);

  // Notify parent of changes - skip during initialization
  useEffect(() => {
    if (isInitializingRef.current) {
      console.log('⏳ MegaMenuForm initializing, skipping onChange call');
      isInitializingRef.current = false;
      return;
    }

    console.log('📤 MegaMenuForm calling onChange - items:', items.length);
    onChange({ static_items: items });
  }, [items]);

  const handleAddItem = () => {
    form.validateFields().then((values) => {
      if (addMethod === 'category' && values.category_id) {
        // Find category info
        const category = categories?.find(c => c.id === values.category_id);
        if (category) {
          const newItem: MenuItem = {
            id: uuidv4(),
            label: category.name,
            href: `/categories/${category.id}`,
            sort_order: items.length,
            source: 'category',
            category_id: category.id,
          };
          setItems([...items, newItem]);
        }
      } else {
        // Manual entry
        const newItem: MenuItem = {
          id: uuidv4(),
          label: values.label,
          href: values.href || '#',
          sort_order: items.length,
          source: 'manual',
        };
        setItems([...items, newItem]);
      }

      form.resetFields();
      setItemFormVisible(false);
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setAddMethod(item.source || 'manual');
    
    if (item.source === 'category') {
      form.setFieldsValue({
        category_id: item.category_id,
      });
    } else {
      form.setFieldsValue({
        label: item.label,
        href: item.href,
      });
    }
    
    setItemFormVisible(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    form.validateFields().then((values) => {
      let updatedItem: MenuItem;
      
      if (addMethod === 'category' && values.category_id) {
        const category = categories?.find(c => c.id === values.category_id);
        if (category) {
          updatedItem = {
            ...editingItem,
            label: category.name,
            href: `/categories/${category.id}`,
            source: 'category',
            category_id: category.id,
          };
        } else {
          return;
        }
      } else {
        updatedItem = {
          ...editingItem,
          label: values.label,
          href: values.href || '#',
          source: 'manual',
          category_id: undefined,
        };
      }

      const updatedItems = items.map(item =>
        item.id === editingItem.id ? updatedItem : item
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
            {/* Method Selection (only show when adding new item) */}
            {!editingItem && (
              <Form.Item label={t('addMethod')} style={{ marginBottom: 16 }}>
                <Radio.Group 
                  value={addMethod} 
                  onChange={(e) => {
                    setAddMethod(e.target.value);
                    form.resetFields();
                  }}
                >
                  <Radio.Button value="category">
                    <AppstoreOutlined /> {t('fromCategory')}
                  </Radio.Button>
                  <Radio.Button value="manual">
                    <LinkOutlined /> {t('manualEntry')}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            )}

            <Divider style={{ margin: '12px 0' }} />

            {addMethod === 'category' ? (
              // Category Selection Method
              <Form.Item
                name="category_id"
                label={t('selectCategory')}
                rules={[{ required: true, message: t('selectCategoryRequired') }]}
                style={{ marginBottom: 12 }}
              >
                <TreeSelect
                  showSearch
                  placeholder={t('searchCategory')}
                  loading={categoriesLoading}
                  treeData={categoryTreeData}
                  treeDefaultExpandAll
                  filterTreeNode={(input, node) => {
                    const title = typeof node?.title === 'string' ? node.title : '';
                    return title.toLowerCase().includes(input.toLowerCase());
                  }}
                  styles={{
                    popup: {
                      root: { maxHeight: 400, overflow: 'auto' }
                    }
                  }}
                />
              </Form.Item>
            ) : (
              // Manual Entry Method
              <>
                <Form.Item
                  name="label"
                  label={t('menuLabel')}
                  rules={[{ required: true, message: t('menuLabelRequired') }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder={t('menuLabelPlaceholder')} />
                </Form.Item>

                <Form.Item
                  name="href"
                  label={t('linkLabel')}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder={t('linkPlaceholder')} />
                </Form.Item>
              </>
            )}

            <Space>
              <Button 
                type="primary" 
                onClick={editingItem ? handleUpdateItem : handleAddItem}
              >
                {editingItem ? t('updateButton') : t('addButton')}
              </Button>
              <Button onClick={handleCancelForm}>{t('cancelButton')}</Button>
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
          {t('addMenuItem')}
        </Button>
      )}

      {/* Items List */}
      <List
        dataSource={items}
        locale={{ emptyText: t('emptyText') }}
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
              title={
                <Space>
                  <Text strong>{item.label}</Text>
                  {item.source === 'category' && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t('categoryBadge')}
                    </Text>
                  )}
                </Space>
              }
              description={<Text type="secondary">{item.href}</Text>}
            />
          </List.Item>
        )}
        bordered
      />
    </Space>
  );
}
