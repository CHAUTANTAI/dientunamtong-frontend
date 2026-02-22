/**
 * CategoryMultiSelect Component
 * Tree select for multiple categories selection
 */

'use client';

import { useMemo } from 'react';
import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd/es/tree-select';
import type { DataNode } from 'antd/es/tree';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import type { Category } from '@/types/category';
import { buildTree, type TreeNode } from '@/utils/tree';

interface CategoryMultiSelectProps extends Omit<TreeSelectProps, 'treeData' | 'multiple'> {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CategoryMultiSelect = ({
  value,
  onChange,
  placeholder = 'Select categories',
  disabled = false,
  ...restProps
}: CategoryMultiSelectProps) => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  /**
   * Build tree data for TreeSelect
   */
  const treeData = useMemo(() => {
    if (!categories.length) return [];

    // Build tree structure sorted by name
    const tree = buildTree<Category>(categories, {
      sortBy: 'name',
    });

    /**
     * Convert tree nodes to TreeSelect format
     */
    const convertToTreeSelectData = (nodes: TreeNode<Category>[]): DataNode[] => {
      return nodes.map((node) => ({
        title: node.data.name,
        value: node.key,
        key: node.key,
        children:
          node.children && node.children.length > 0
            ? convertToTreeSelectData(node.children)
            : undefined,
      }));
    };

    return convertToTreeSelectData(tree);
  }, [categories]);

  /**
   * Handle change
   */
  const handleChange = (newValue: string[]) => {
    onChange?.(newValue || []);
  };

  return (
    <TreeSelect
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled || isLoading}
      loading={isLoading}
      showSearch
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      treeDefaultExpandAll
      treeNodeFilterProp="title"
      treeData={treeData}
      style={{ width: '100%' }}
      maxTagCount="responsive"
      {...restProps}
    />
  );
};

CategoryMultiSelect.displayName = 'CategoryMultiSelect';
