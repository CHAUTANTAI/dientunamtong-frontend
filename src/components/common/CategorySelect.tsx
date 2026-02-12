/**
 * CategorySelect Component
 * Select parent category with tree structure display
 * Prevents circular reference (can't select self or descendants)
 */

'use client';

import { useMemo } from 'react';
import { TreeSelect, Spin } from 'antd';
import type { TreeSelectProps } from 'antd/es/tree-select';
import type { DataNode } from 'antd/es/tree';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { Category } from '@/types/category';
import { buildTree, getDescendants, type TreeNode } from '@/utils/tree';

interface CategorySelectProps extends Omit<TreeSelectProps, 'treeData'> {
  value?: string | null;
  onChange?: (value: string | null) => void;
  excludeId?: string; // Exclude this category and its descendants (for editing)
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
}

export const CategorySelect = ({
  value,
  onChange,
  excludeId,
  placeholder = 'Select parent category',
  allowClear = true,
  disabled = false,
  ...restProps
}: CategorySelectProps) => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  /**
   * Build tree structure and filter out excluded categories
   */
  const treeData = useMemo(() => {
    if (!categories.length) return [];

    // Build tree structure
    const tree = buildTree<Category>(categories, {
      sortBy: 'sort_order',
    });

    // Get excluded IDs (self + descendants)
    const excludedIds = new Set<string>();
    if (excludeId) {
      excludedIds.add(excludeId);
      
      // Find excluded node and get all descendants
      const findNode = (nodes: TreeNode<Category>[]): TreeNode<Category> | null => {
        for (const node of nodes) {
          if (node.key === excludeId) return node;
          if (node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const excludedNode = findNode(tree);
      if (excludedNode) {
        const descendants = getDescendants(excludedNode);
        descendants.forEach((node) => excludedIds.add(node.key));
      }
    }

    /**
     * Convert tree nodes to TreeSelect format
     */
    const convertToTreeSelectData = (
      nodes: TreeNode<Category>[]
    ): DataNode[] => {
      return nodes.map((node) => {
        const isExcluded = excludedIds.has(node.key);
        
        return {
          title: node.data.name,
          value: node.key,
          key: node.key,
          disabled: isExcluded,
          children:
            node.children && node.children.length > 0
              ? convertToTreeSelectData(node.children)
              : undefined,
        };
      });
    };

    return convertToTreeSelectData(tree);
  }, [categories, excludeId]);

  /**
   * Handle change
   */
  const handleChange = (newValue: string) => {
    onChange?.(newValue || null);
  };

  return (
    <TreeSelect
      value={value || undefined}
      onChange={handleChange}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled || isLoading}
      loading={isLoading}
      showSearch
      treeDefaultExpandAll
      treeNodeFilterProp="title"
      treeData={treeData}
      notFoundContent={isLoading ? <Spin size="small" /> : 'No categories found'}
      style={{ width: '100%' }}
      {...restProps}
    />
  );
};

CategorySelect.displayName = 'CategorySelect';

