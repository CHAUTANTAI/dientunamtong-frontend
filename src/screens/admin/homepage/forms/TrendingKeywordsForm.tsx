'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Space, Typography, List, Card, Select, Radio, Tag, TreeSelect } from 'antd';
import { PlusOutlined, DeleteOutlined, AppstoreOutlined, ShoppingOutlined } from '@ant-design/icons';
import type { TrendingKeywordsContent } from '@/types/pageSection';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import { useDebounce } from '@/hooks/useDebounce';
import type { Category } from '@/types/category';
import { useTranslations } from 'next-intl';

const { Text } = Typography;

interface TrendingKeywordsFormProps {
  content: TrendingKeywordsContent;
  onChange: (content: TrendingKeywordsContent) => void;
}

interface Keyword {
  id: string;
  text: string;
  link: string;
  source: 'category' | 'product';
  source_id: string;
  sort_order: number;
}

/**
 * TrendingKeywordsForm - Inline form for Trending Keywords
 * Features:
 * - Fixed title: "Xu hướng tìm kiếm:" (no editing)
 * - Icon always shown (no toggle)
 * - Auto mode: Top 5 categories + Top 5 products by views
 * - Manual mode: Select categories or products
 */
export default function TrendingKeywordsForm({ content, onChange }: TrendingKeywordsFormProps) {
  const t = useTranslations('homepageEditor.forms.trendingKeywords');
  const [mode, setMode] = useState<'auto' | 'manual'>(() => content?.mode || 'manual');
  const [keywords, setKeywords] = useState<Keyword[]>(() => content?.keywords || []);
  const [selectedSource, setSelectedSource] = useState<'category' | 'product'>('category');
  const [selectedId, setSelectedId] = useState<string>('');
  const [categorySearchValue, setCategorySearchValue] = useState<string>('');
  const [productSearchValue, setProductSearchValue] = useState<string>('');
  const isInitializingRef = useRef(true);

  // Fetch categories and products
  const { data: categories = [], isLoading: categoriesLoading } = useGetPublicCategoriesQuery();
  const { data: products = [], isLoading: productsLoading } = useGetPublicProductsQuery();

  // Debounce search values
  const debouncedCategorySearch = useDebounce(categorySearchValue, 300);
  const debouncedProductSearch = useDebounce(productSearchValue, 300);

  // Initialize `mode` and `keywords` from props; avoid setting state inside
  // useEffect to satisfy hooks lint rules. `isInitializingRef` still prevents
  // sending onChange on first render.

  // Call onChange only after content is synced and not initializing
  useEffect(() => {
    if (isInitializingRef.current) {
      console.log('⏳ TrendingKeywordsForm initializing, skipping onChange call');
      isInitializingRef.current = false;
      return;
    }

    console.log('📤 TrendingKeywordsForm calling onChange - mode:', mode, 'keywords:', keywords.length);
    onChange({
      mode,
      keywords,
    });
  }, [mode, keywords]);

  const handleModeChange = (newMode: 'auto' | 'manual') => {
    setMode(newMode);
    if (newMode === 'auto') {
      setKeywords([]); // Clear manual keywords when switching to auto
    }
  };

  const handleAddKeyword = () => {
    if (!selectedId) return;

    // Check if already exists
    if (keywords.some(k => k.source_id === selectedId)) {
      return;
    }

    let text = '';
    let link = '';

    if (selectedSource === 'category') {
      const category = categories.find(c => c.id === selectedId);
      if (!category) return;
      text = category.name;
      link = `/categories/${category.id}`;
    } else {
      const product = products.find(p => p.id === selectedId);
      if (!product) return;
      text = product.name;
      link = `/products/${product.id}`;
    }

    const newKeyword: Keyword = {
      id: `keyword_${Date.now()}`,
      text,
      link,
      source: selectedSource,
      source_id: selectedId,
      sort_order: keywords.length,
    };

    setKeywords([...keywords, newKeyword]);
    setSelectedId('');
  };

  const handleDeleteKeyword = (id: string) => {
    const filtered = keywords.filter(k => k.id !== id);
    const reordered = filtered.map((k, index) => ({ ...k, sort_order: index }));
    setKeywords(reordered);
  };

  // Build category tree for TreeSelect
  interface TreeNode {
    value: string;
    title: string;
    children?: TreeNode[];
  }

  interface CategoryWithChildren extends Category {
    children: CategoryWithChildren[];
  }

  const categoryTreeData = useMemo(() => {
    const buildCategoryTree = (): TreeNode[] => {
      if (!categories || categories.length === 0) return [];

      // Create a map of categories by ID
      const categoryMap = new Map<string, CategoryWithChildren>();
      categories.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Build parent-child relationships
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

      // Convert to TreeNode format
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
  }, [categories]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* Mode Selection */}
      <div>
        <Text strong>{t('modeLabel')}</Text>
        <Radio.Group
          value={mode}
          onChange={(e) => handleModeChange(e.target.value)}
          style={{ marginTop: 8, display: 'block' }}
        >
          <Space direction="vertical">
            <Radio value="auto">
              <Space>
                <Text>{t('autoMode')}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({t('autoDescription')})
                </Text>
              </Space>
            </Radio>
            <Radio value="manual">
              <Space>
                <Text>{t('manualMode')}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  (Select specific categories or products)
                </Text>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </div>

      {/* Manual Mode: Add Keyword Form */}
      {mode === 'manual' && (
        <Card size="small" title={t('addKeywordTitle')}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Select Source Type */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{t('selectType')}</Text>
              <Radio.Group
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setSelectedId('');
                }}
                style={{ marginTop: 4, display: 'block' }}
              >
                <Radio value="category">
                  <AppstoreOutlined /> {t('categoryOption')}
                </Radio>
                <Radio value="product">
                  <ShoppingOutlined /> {t('productOption')}
                </Radio>
              </Radio.Group>
            </div>

            {/* Select Category or Product */}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Select {selectedSource === 'category' ? 'Category' : 'Product'}
              </Text>
              {selectedSource === 'category' ? (
                <TreeSelect
                  showSearch
                  placeholder={t('searchCategoryPlaceholder')}
                  value={selectedId || undefined}
                  onChange={setSelectedId}
                  onSearch={setCategorySearchValue}
                  searchValue={categorySearchValue}
                  loading={categoriesLoading}
                  treeData={categoryTreeData}
                  treeDefaultExpandAll={!debouncedCategorySearch}
                  filterTreeNode={(input, node) => {
                    // Use debounced search value for filtering
                    const searchTerm = debouncedCategorySearch.toLowerCase();
                    if (!searchTerm) return true;
                    const title = typeof node?.title === 'string' ? node.title : '';
                    return title.toLowerCase().includes(searchTerm);
                  }}
                  styles={{
                    popup: {
                      root: { maxHeight: 400 }
                    }
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                />
              ) : (
                <Select
                  showSearch
                  placeholder={t('searchProductPlaceholder')}
                  value={selectedId || undefined}
                  onChange={setSelectedId}
                  onSearch={setProductSearchValue}
                  searchValue={productSearchValue}
                  loading={productsLoading}
                  style={{ width: '100%', marginTop: 4 }}
                  filterOption={(input, option) => {
                    // Use debounced search value for filtering
                    const searchTerm = debouncedProductSearch.toLowerCase();
                    if (!searchTerm) return true;
                    return (option?.label?.toString() ?? '').toLowerCase().includes(searchTerm);
                  }}
                  options={products.map(p => ({ label: p.name, value: p.id }))}
                />
              )}
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddKeyword}
              disabled={!selectedId}
              block
            >
              {t('addButton')} Keyword
            </Button>
          </Space>
        </Card>
      )}

      {/* Manual Mode: Keywords List */}
      {mode === 'manual' && (
        <div>
          <Text strong>Selected Keywords ({keywords.length})</Text>
          {keywords.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#fafafa', marginTop: 8, borderRadius: 4 }}>
              <Text type="secondary">{t('noKeywords')}</Text>
            </div>
          ) : (
            <List
              dataSource={keywords}
              renderItem={(keyword) => (
                <List.Item
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteKeyword(keyword.id)}
                    />,
                  ]}
                  style={{ padding: '8px 16px' }}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text>{keyword.text}</Text>
                        <Tag color={keyword.source === 'category' ? 'blue' : 'green'}>
                          {keyword.source === 'category' ? <AppstoreOutlined /> : <ShoppingOutlined />}
                          {' '}
                          {keyword.source}
                        </Tag>
                      </Space>
                    }
                    description={<Text type="secondary" style={{ fontSize: 12 }}>{keyword.link}</Text>}
                  />
                </List.Item>
              )}
              style={{ marginTop: 8 }}
              bordered
            />
          )}
        </div>
      )}
    </Space>
  );
}
