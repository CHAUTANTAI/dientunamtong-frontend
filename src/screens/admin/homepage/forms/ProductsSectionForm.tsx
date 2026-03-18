'use client';

import { useState, useEffect, useMemo } from 'react';
import { Space, Typography, TreeSelect, Alert, Card, Radio, Select, Button, List } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import type { ProductsSectionContent } from '@/types/pageSection';
import { useGetPublicCategoriesQuery } from '@/store/services/publicCategoryApi';
import { useGetPublicProductsQuery } from '@/store/services/publicProductApi';
import type { Category } from '@/types/category';

const { Text } = Typography;

interface ProductsSectionFormProps {
  content: ProductsSectionContent;
  onChange: (content: ProductsSectionContent) => void;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

interface TreeNode {
  value: string;
  title: string;
  children?: TreeNode[];
}

type CategoryConfig = {
  category_id: string;
  mode: 'auto' | 'manual';
  product_ids?: string[];
};

/**
 * ProductsSectionForm - Multi-category selector (max 3) with auto/manual mode per category
 */
export default function ProductsSectionForm({
  content,
  onChange,
}: ProductsSectionFormProps) {
  const [categories, setCategories] = useState<CategoryConfig[]>(content?.categories || []);

  // Fetch data
  const { data: categoryData = [], isLoading: categoriesLoading } = useGetPublicCategoriesQuery();
  const { data: products = [], isLoading: productsLoading } = useGetPublicProductsQuery();

  useEffect(() => {
    setCategories(content?.categories || []);
  }, [content]);

  useEffect(() => {
    const currentState = JSON.stringify(categories);
    const contentState = JSON.stringify(content?.categories || []);
    
    if (currentState !== contentState) {
      onChange({
        categories: categories.length > 0 ? categories : undefined,
      });
    }
  }, [categories, content?.categories, onChange]);

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

  // Get available categories (not already selected)
  const selectedCategoryIds = categories.map(c => c.category_id);
  const availableCategories = categoryTreeData.filter(
    node => !selectedCategoryIds.includes(node.value)
  );

  const handleAddCategory = (categoryId: string) => {
    if (categories.length >= 3) return;
    
    setCategories([...categories, {
      category_id: categoryId,
      mode: 'auto',
      product_ids: [],
    }]);
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const handleModeChange = (index: number, mode: 'auto' | 'manual') => {
    const newCategories = [...categories];
    newCategories[index].mode = mode;
    if (mode === 'auto') {
      newCategories[index].product_ids = [];
    }
    setCategories(newCategories);
  };

  const handleProductSelect = (index: number, productIds: string[]) => {
    const newCategories = [...categories];
    newCategories[index].product_ids = productIds.slice(0, 6); // Max 6 products
    setCategories(newCategories);
  };

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

  // Get all descendant category IDs (including the category itself)
  const getAllDescendantCategoryIds = (categoryId: string): string[] => {
    const result: string[] = [categoryId];
    
    const findDescendants = (parentId: string) => {
      const children = categoryData.filter(cat => cat.parent_id === parentId);
      children.forEach(child => {
        result.push(child.id);
        findDescendants(child.id); // Recursive
      });
    };
    
    findDescendants(categoryId);
    return result;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Alert
        message="Products Section Info"
        description="Select up to 3 categories. For each category, choose Auto mode (top 6 by views) or Manual mode (select specific products)."
        type="info"
        showIcon
      />

      {/* Category List */}
      <List
        dataSource={categories}
        locale={{ emptyText: 'No categories selected' }}
        renderItem={(category, index) => {
          // Get all descendant category IDs (parent + all children/grandchildren)
          const relevantCategoryIds = getAllDescendantCategoryIds(category.category_id);
          
          // Filter products that belong to this category OR any of its descendants
          const categoryProducts = products.filter(p => 
            p.is_active && p.categories?.some(cat => relevantCategoryIds.includes(cat.id))
          );

          return (
            <List.Item key={category.category_id} style={{ padding: '0 0 16px 0' }}>
              <Card 
                size="small" 
                style={{ width: '100%' }}
                title={
                  <Space>
                    <Text strong>{index + 1}. {getCategoryName(category.category_id)}</Text>
                  </Space>
                }
                extra={
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveCategory(index)}
                  >
                    Remove
                  </Button>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {/* Mode Selection */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Display Mode:</Text>
                    <Radio.Group
                      value={category.mode}
                      onChange={(e) => handleModeChange(index, e.target.value)}
                      style={{ marginLeft: 8 }}
                    >
                      <Radio value="auto">Auto (Top 6 by views)</Radio>
                      <Radio value="manual">Manual (Select products)</Radio>
                    </Radio.Group>
                  </div>

                  {/* Manual Mode Product Selection */}
                  {category.mode === 'manual' && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Select Products (Max 6):
                      </Text>
                      <Select
                        mode="multiple"
                        maxCount={6}
                        placeholder="Search and select products"
                        value={category.product_ids || []}
                        onChange={(values) => handleProductSelect(index, values)}
                        loading={productsLoading}
                        style={{ width: '100%', marginTop: 4 }}
                        showSearch
                        filterOption={(input, option) => {
                          const label = option?.label?.toString() || '';
                          return label.toLowerCase().includes(input.toLowerCase());
                        }}
                        options={categoryProducts.map(p => ({
                          value: p.id,
                          label: p.name,
                        }))}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {(category.product_ids?.length || 0)}/6 products selected
                      </Text>
                    </div>
                  )}
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />

      {/* Add Category Button */}
      {categories.length < 3 && (
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Add Category ({categories.length}/3)</Text>
            <TreeSelect
              showSearch
              placeholder="Search and select a category"
              value={undefined}
              onChange={handleAddCategory}
              loading={categoriesLoading}
              treeData={availableCategories}
              treeDefaultExpandAll
              filterTreeNode={(input, node) => {
                const title = typeof node?.title === 'string' ? node.title : '';
                return title.toLowerCase().includes(input.toLowerCase());
              }}
              style={{ width: '100%' }}
            />
          </Space>
        </Card>
      )}
    </Space>
  );
}
