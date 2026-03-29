'use client';

import { useState, useEffect, useMemo } from 'react';
import { Radio, Typography, Space, Alert, TreeSelect, List, Button, Tag, Input, InputNumber, Divider, Form } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { LeftSidebarContent } from '@/types/pageSection';
import MediaUpload, { MediaValue } from '@/components/common/MediaUpload';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import type { Category } from '@/types/category';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface LeftSidebarContentDraft extends Omit<LeftSidebarContent, 'promotional_banner'> {
  promotional_banner?: {
    media_id: MediaValue; // string path or PendingUpload
    link?: string;
    alt?: string;
    sort_order?: number;
  };
}

interface LeftSidebarFormProps {
  content: LeftSidebarContentDraft;
  onChange: (content: LeftSidebarContentDraft) => void;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

interface TreeNode {
  value: string;
  title: string;
  children?: TreeNode[];
}

/**
 * LeftSidebarForm - Categories menu with auto/manual mode
 * Auto: Top 8 categories by views
 * Manual: Select up to 8 categories independently (no auto-check children)
 */
export default function LeftSidebarForm({
  content,
  onChange,
}: LeftSidebarFormProps) {
  const t = useTranslations('homepageEditor.forms.leftSidebar');
  const [mode, setMode] = useState<'auto' | 'manual'>(() => content?.mode || 'auto');
  const [categoryIds, setCategoryIds] = useState<string[]>(() => content?.category_ids || []);
  // Banner state
  const [bannerMedia, setBannerMedia] = useState<MediaValue>(() => content?.promotional_banner?.media_id || null);
  const [bannerLink, setBannerLink] = useState<string>(() => content?.promotional_banner?.link || '');
  const [bannerAlt, setBannerAlt] = useState<string>(() => content?.promotional_banner?.alt || '');
  const [bannerSortOrder, setBannerSortOrder] = useState<number>(() => content?.promotional_banner?.sort_order ?? 0);

  // Fetch categories
  const { data: categoryData = [], isLoading } = useGetPublicCategoriesQuery();

  useEffect(() => {
    // Sync categories
    const currentState = JSON.stringify({ mode, category_ids: categoryIds });
    const contentState = JSON.stringify({ 
      mode: content?.mode || 'auto', 
      category_ids: content?.category_ids || [] 
    });
    if (currentState !== contentState) {
      onChange({
        ...content,
        mode,
        category_ids: mode === 'manual' ? categoryIds : undefined,
        max_items: 8,
        promotional_banner: bannerMedia ? {
            // Keep the MediaValue (string path or PendingUpload) so save handler can upload if needed
            media_id: bannerMedia,
            link: bannerLink,
            alt: bannerAlt,
            sort_order: bannerSortOrder,
          } : undefined,
      });
    }
  }, [mode, categoryIds]);

  // Sync banner changes
  useEffect(() => {
    onChange({
      ...content,
      mode,
      category_ids: mode === 'manual' ? categoryIds : undefined,
      max_items: 8,
      promotional_banner: bannerMedia ? {
        media_id: bannerMedia,
        link: bannerLink,
        alt: bannerAlt,
        sort_order: bannerSortOrder,
      } : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerMedia, bannerLink, bannerAlt, bannerSortOrder]);

  // Build category tree
  const categoryTreeData = useMemo(() => {
    const buildCategoryTree = (): TreeNode[] => {
      if (!categoryData || categoryData.length === 0) return [];

      const categoryMap = new Map<string, CategoryWithChildren>();
      categoryData.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      const roots: CategoryWithChildren[] = [];
      categoryMap.forEach((cat) => {
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children.push(cat);
          }
        } else {
          roots.push(cat);
        }
      });

      const convertToTreeNode = (cat: CategoryWithChildren): TreeNode => {
        const node: TreeNode = {
          value: cat.id,
          title: cat.name,
        };
        if (cat.children && cat.children.length > 0) {
          node.children = cat.children.map(convertToTreeNode);
        }
        return node;
      };

      return roots.map(convertToTreeNode);
    };

    return buildCategoryTree();
  }, [categoryData]);

  const getCategoryName = (categoryId: string) => {
    const findName = (nodes: TreeNode[]): string | null => {
      for (const node of nodes) {
        if (node.value === categoryId) return node.title;
        if (node.children) {
          const found = findName(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findName(categoryTreeData) || categoryId;
  };

  const handleModeChange = (newMode: 'auto' | 'manual') => {
    setMode(newMode);
    if (newMode === 'auto') {
      setCategoryIds([]);
    }
  };

  const handleAddCategory = (categoryId: string) => {
    if (categoryIds.length >= 8) return;
    if (!categoryIds.includes(categoryId)) {
      setCategoryIds([...categoryIds, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setCategoryIds(categoryIds.filter(id => id !== categoryId));
  };

  // Get available categories (not already selected)
  const availableCategories = categoryTreeData.filter(
    node => !categoryIds.includes(node.value)
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Alert
        message="Left Sidebar - Categories Menu"
        description="Display categories in a collapsible tree menu. Choose Auto mode (top 8 by views) or Manual mode (select specific categories)."
        type="info"
        showIcon
      />

      {/* Mode Selection */}
      <div>
        <Text strong>{t('modeLabel')}:</Text>
        <Radio.Group
          value={mode}
          onChange={(e) => handleModeChange(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          <Radio value="auto">{t('autoMode')} (Top 8 by views)</Radio>
          <Radio value="manual">{t('manualMode')} (Select categories)</Radio>
        </Radio.Group>
      </div>

      {/* Manual Mode - Category Selection */}
      {mode === 'manual' && (
        <>
          <Alert
            message="Manual Mode Active"
            description={t('manualDescription')}
            type="success"
            showIcon
          />

          {/* Selected Categories List */}
          {categoryIds.length > 0 && (
            <div>
              <Text strong>{t('selectedCategories', { count: categoryIds.length })}:</Text>
              <List
                size="small"
                bordered
                style={{ marginTop: 8 }}
                dataSource={categoryIds}
                renderItem={(catId, index) => (
                  <List.Item
                    actions={[
                      <Button
                        key="remove"
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveCategory(catId)}
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <Tag color="blue">{index + 1}</Tag> {getCategoryName(catId)}
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Add Category */}
          {categoryIds.length < 8 && (
            <div>
              <Text strong>Add Category ({categoryIds.length}/8):</Text>
              <TreeSelect
                showSearch
                placeholder={t('searchPlaceholder')}
                value={undefined}
                onChange={handleAddCategory}
                loading={isLoading}
                treeData={availableCategories}
                treeDefaultExpandAll
                filterTreeNode={(input, node) => {
                  const title = typeof node?.title === 'string' ? node.title : '';
                  return title.toLowerCase().includes(input.toLowerCase());
                }}
                style={{ width: '100%', marginTop: 8 }}
              />
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                Note: Selecting a parent category does NOT automatically select its children. Each category is independent.
              </Text>
            </div>
          )}
        </>
      )}

      {/* Auto Mode Info */}
      {mode === 'auto' && (
        <Alert
          message="Auto Mode Active"
          description={t('autoDescription')}
          type="success"
          showIcon
        />
      )}
    {/* Promotional Banner Editor */}
    <Divider orientation="left">Promotional Banner (optional)</Divider>
    <Form layout="vertical">
      <Form.Item label="Banner Image">
        <MediaUpload
          value={bannerMedia}
          onChange={setBannerMedia}
          folder="banners"
          label="Upload Banner"
          helperText="Recommended: 300x180px, JPG/PNG, max 1MB"
        />
      </Form.Item>
      <Form.Item label="Banner Link">
        <Input
          value={bannerLink}
          onChange={e => setBannerLink(e.target.value)}
          placeholder="https://... (optional)"
        />
      </Form.Item>
      <Form.Item label="Alt Text">
        <Input
          value={bannerAlt}
          onChange={e => setBannerAlt(e.target.value)}
          placeholder="Description for accessibility (optional)"
        />
      </Form.Item>
      <Form.Item label="Sort Order">
        <InputNumber
          min={0}
          max={99}
          value={bannerSortOrder}
          onChange={v => setBannerSortOrder(Number(v) || 0)}
        />
      </Form.Item>
      {bannerMedia && (
        <Button danger icon={<DeleteOutlined />} onClick={() => setBannerMedia(null)}>
          Remove Banner
        </Button>
      )}
    </Form>
    </Space>
  );
}
